import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/environment';
import { ApiResponse, LoginCredentials, User } from '../types';

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    // Даем время AsyncStorage обновиться
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Сначала пытаемся получить LDAP токен, потом legacy токен
    let token = await AsyncStorage.getItem('ldap_access_token');
    if (!token || token === 'undefined' || token === 'null') {
      token = await AsyncStorage.getItem('authToken');
    }
    
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `Bearer ${token}`;  // Используем Bearer для LDAP токенов
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const url = `${API_BASE_URL}${endpoint}`;
      
      const finalHeaders = {
        ...headers,
        ...options.headers,
      };
      
      // Avoid logging URLs with sensitive identifiers
      // console.log(`🌐 Making request to: ${url}`); // REMOVED: may contain sensitive info (userId etc.)
      
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      
      const data = await response.json();

      if (!response.ok) {
        
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data, // Обрабатываем как wrapped, так и unwrapped ответы
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Используем наш бэкенд как прокси для LDAP авторизации
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Ошибка входа';
        
        if (response.status === 401) {
          errorMessage = 'Неверное имя пользователя или пароль';
        } else if (response.status === 400) {
          errorMessage = data.error || 'Некорректные данные для входа';
        } else if (response.status === 503) {
          errorMessage = 'Сервер авторизации временно недоступен';
        } else {
          errorMessage = data.error || `Ошибка ${response.status}`;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Django прокси возвращает данные в формате {success: true, data: {...}}
      if (!data.success || !data.data) {
        return {
          success: false,
          error: data.error || 'Неверный формат ответа сервера',
        };
      }

      const { access_token, refresh_token, user: ldapProfile } = data.data;

      // Преобразуем LDAP профиль в формат User если он есть
      let user: User;
      if (ldapProfile) {
        user = {
          id: ldapProfile.jshr || credentials.username,
          username: credentials.username,
          email: ldapProfile.email || `${credentials.username}@tiue.uz`,
          first_name: this.extractFirstName(ldapProfile.full_name || ''),
          last_name: this.extractLastName(ldapProfile.full_name || ''),
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Сохраняем полный LDAP профиль для отображения
          ldap_profile: ldapProfile,
          student: {
            group: {
              name: ldapProfile.group || '',
              course: this.extractCourseFromGroup(ldapProfile.group || ''),
            },
            course: this.extractCourseFromGroup(ldapProfile.group || ''),
          },
        };
      } else {
        // Создаем базовый профиль если LDAP профиль не получен
        user = {
          id: credentials.username,
          username: credentials.username,
          email: `${credentials.username}@tiue.uz`,
          first_name: '',
          last_name: '',
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // Сохраняем токены
      await Promise.all([
        AsyncStorage.setItem('authToken', access_token), // Legacy совместимость
        AsyncStorage.setItem('ldap_access_token', access_token),
        AsyncStorage.setItem('ldap_refresh_token', refresh_token),
      ]);


      return {
        success: true,
        data: { user, token: access_token },
      };
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Login error:', error);
      }
      return {
        success: false,
        error: 'Проблема с подключением к серверу',
      };
    }
  }

  // Утилитарные методы для парсинга LDAP данных
  private extractFirstName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts[1] || ''; // Второе слово обычно имя
  }

  private extractLastName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts[0] || ''; // Первое слово обычно фамилия
  }

  private extractCourseFromGroup(groupName: string): number {
    // Извлекаем курс из названия группы (например, "RB22-01" -> 3-й курс в 2025)
    const match = groupName.match(/(\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      const currentYear = new Date().getFullYear() % 100;
      return Math.max(1, currentYear - year + 1);
    }
    return 1;
  }

  async logout(): Promise<void> {
    try {
      // LDAP не требует серверного logout, просто очищаем токены
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('ldap_access_token'),
        AsyncStorage.removeItem('ldap_refresh_token'),
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error clearing tokens:', error);
      }
    }
    
    // Очищаем кеш пользователя и dashboard
    this.clearUserCache();
    this.clearDashboardCache();
    
  }

  // Добавляем функцию для принудительной очистки storage
  async clearStorage(): Promise<void> {

    await Promise.all([
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('ldap_access_token'),
      AsyncStorage.removeItem('ldap_refresh_token'),
    ]);
    
    // Очищаем кеши
    this.clearUserCache();
    this.clearDashboardCache();
    
  }

  // Кешируем запрос текущего пользователя для предотвращения дублирования
  private currentUserPromise: Promise<ApiResponse<User>> | null = null;
  private currentUserCache: { data: ApiResponse<User>; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 30000; // 30 секунд

  async getCurrentUser(): Promise<ApiResponse<User>> {
    // Проверяем кеш
    if (this.currentUserCache && 
        Date.now() - this.currentUserCache.timestamp < this.CACHE_DURATION) {
      return this.currentUserCache.data;
    }

    // Если уже есть активный запрос, возвращаем его
    if (this.currentUserPromise) {

      return this.currentUserPromise;
    }


    // Создаем новый запрос к LDAP API
    this.currentUserPromise = this.getLDAPCurrentUser()
      .then((result) => {
        // Кешируем успешный результат
        if (result.success) {
          this.currentUserCache = {
            data: result,
            timestamp: Date.now()
          };
        }
        
        
        return result;
      })
      .finally(() => {
        // Очищаем промис после завершения
        this.currentUserPromise = null;
      });

    return this.currentUserPromise;
  }

  private async getLDAPCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // Получаем токен из AsyncStorage (сначала LDAP, потом legacy)
      let token = await AsyncStorage.getItem('ldap_access_token');
      if (!token || token === 'undefined' || token === 'null') {
        token = await AsyncStorage.getItem('authToken');
      }
      
      if (!token || token === 'undefined' || token === 'null') {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      // Получаем профиль пользователя через наш бэкенд
      // Делаем запрос к нашему бэкенду, который проксирует к LDAP
      const response = await fetch(`${API_BASE_URL}/auth/me/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Если токен истек, не очищаем сразу
        if (response.status === 401) {
          // await this.clearStorage();
        }
        return {
          success: false,
          error: data.error || 'Failed to get user profile',
        };
      }

      if (!data.success || !data.data) {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }

      // Преобразуем LDAP профиль в формат User
      const ldapProfile = data.data;
      const user: User = {
        id: ldapProfile.jshr || 'unknown',
        username: ldapProfile.email ? ldapProfile.email.split('@')[0] : 'unknown',
        email: ldapProfile.email || '',
        first_name: this.extractFirstName(ldapProfile.full_name || ''),
        last_name: this.extractLastName(ldapProfile.full_name || ''),
        role: 'student',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Сохраняем полный LDAP профиль для отображения
        ldap_profile: ldapProfile,
        student: {
          group: {
            name: ldapProfile.group || '',
            course: this.extractCourseFromGroup(ldapProfile.group || ''),
          },
          course: this.extractCourseFromGroup(ldapProfile.group || ''),
        },
      };

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to get LDAP user:', error);
      }
      return {
        success: false,
        error: 'Failed to get current user',
      };
    }
  }

  // Метод для очистки кеша пользователя (например, при логауте)
  clearUserCache(): void {
    this.currentUserCache = null;
    this.currentUserPromise = null;

  }

  // User management (admin only)
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users/');
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}/`, {
      method: 'DELETE',
    });
  }

  // Groups management
  async getGroups(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/groups/');
  }

  async createGroup(groupData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/groups/', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  // Schedule management
  async getSchedule(groupId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = groupId ? `/schedule/?group=${groupId}` : '/schedule/';
    return this.request<any[]>(endpoint);
  }

  async updateSchedule(scheduleData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/schedule/', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  // News management
  async getNews(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/news/');
  }

  async createNews(newsData: any): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `${API_BASE_URL}/news/`;

      // Если есть изображение, используем FormData
      if (newsData.image) {
        const formData = new FormData();
        
        // Добавляем все поля новости
        formData.append('title', newsData.title);
        formData.append('subtitle', newsData.subtitle || '');
        formData.append('content', newsData.content);
        formData.append('category', newsData.category);
        if (newsData.icon) {
          formData.append('icon', newsData.icon);
        }
        if (newsData.is_important !== undefined) {
          formData.append('is_important', newsData.is_important.toString());
        }

        const imageUri = newsData.image.uri;
        const timestamp = Date.now();
        const filename = `news_${timestamp}.jpg`;
        
        // Создаем объект для FormData в React Native
        const imageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: filename,
        } as any;
        
        // Добавляем файл в FormData
        formData.append('image', imageFile);

        const apiResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            // НЕ устанавливаем Content-Type для multipart/form-data
          },
          body: formData,
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
          return {
            success: false,
            error: data.error || data.message || `HTTP ${apiResponse.status}`,
          };
        }

        return {
          success: true,
          data: data.data || data,
        };
      } else {
        // Без изображения используем обычный JSON
        return this.request<any>('/news/', {
          method: 'POST',
          body: JSON.stringify(newsData),
        });
      }
    } catch (error) {
      console.error('Create news error:', error);
      return {
        success: false,
        error: 'Ошибка создания новости с изображением',
      };
    }
  }

  async updateNews(newsId: string, newsData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/news/${newsId}/`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    });
  }

  async deleteNews(newsId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/news/${newsId}/`, {
      method: 'DELETE',
    });
  }

  // Events management
  async getEvents(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/events/');
  }

  async createEvent(eventData: any): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `${API_BASE_URL}/events/`;


      if (eventData.image) {
        const formData = new FormData();
        formData.append('title', eventData.title);
        formData.append('description', eventData.description);
        formData.append('location', eventData.location);
        formData.append('date', eventData.date);
        formData.append('time', eventData.time);
        formData.append('category', eventData.category);
        if (eventData.max_participants) {
          formData.append('max_participants', eventData.max_participants.toString());
        }

        let imageUri = eventData.image.uri;

        if (!imageUri) {
          if (__DEV__) {
            console.warn('⚠️ createEvent(): image object missing uri');
          }
        } else if (imageUri.startsWith('/')) {
          // Normalize plain path to file:// for Android
            imageUri = 'file://' + imageUri;
        }

        const now = new Date();
        const filename = `evt_${now.getTime()}.jpg`;

        // React Native-совместимая обработка изображения
        const imageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: filename,
        } as any;
        
        // Добавляем файл в FormData
        formData.append('image', imageFile);

        let apiResponse: Response;
        try {
          apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
          });
        } catch (networkErr: any) {
          if (__DEV__) {
            console.error('🌐 createEvent(): network layer failure', networkErr?.message || networkErr);
          }
          try {
            const fallback = await this.request<any>('/events/', {
              method: 'POST',
              body: JSON.stringify({
                title: eventData.title,
                description: eventData.description,
                location: eventData.location,
                date: eventData.date,
                time: eventData.time,
                category: eventData.category,
                max_participants: eventData.max_participants,
              }),
            });
            if (fallback.success) {
              return { success: true, data: fallback.data, error: 'Изображение не загружено (fallback)' };
            }
            return { success: false, error: 'Сеть недоступна (multipart) и fallback не удался' };
          } catch (fbErr) {
            if (__DEV__) {
              console.error('❌ createEvent(): fallback failed', fbErr);
            }
            return { success: false, error: 'Сеть недоступна (multipart)' };
          }
        }

        let data: any = null;
        try {
          data = await apiResponse.json();
        } catch (parseErr) {
          if (__DEV__) {
            console.error('🧩 createEvent(): JSON parse failed', parseErr);
          }
        }

        if (!apiResponse.ok) {
          if (__DEV__) {
            console.error('❌ createEvent(): server responded with error status', apiResponse.status, data);
          }
          return { success: false, error: data?.error || data?.message || `HTTP ${apiResponse.status}` };
        }

        return { success: true, data: data?.data || data };
      } else {
        return this.request<any>('/events/', {
          method: 'POST',
          body: JSON.stringify(eventData),
        });
      }
    } catch (error) {
      console.error('Create event error:', error);
      return {
        success: false,
        error: 'Ошибка создания события с изображением',
      };
    }
  }

  async updateEvent(eventId: string, eventData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/events/${eventId}/`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string): Promise<ApiResponse<void>> {
    try {
      
      const token = await AsyncStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers.Authorization = `Token ${token}`;
      }
      
      const url = `${API_BASE_URL}/events/${eventId}/`;
      
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });


      // DELETE возвращает 204 без контента, поэтому не парсим JSON
      if (response.ok) {
        return {
          success: true,
          data: undefined as any,
        };
      } else {
        // Только если есть ошибка, пытаемся парсить JSON
        try {
          const data = await response.json();
          return {
            success: false,
            error: data.error || data.message || `HTTP ${response.status}`,
          };
        } catch (parseError) {

          return {
            success: false,
            error: `HTTP ${response.status}`,
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Кешируем dashboard данные
  private dashboardPromise: Promise<ApiResponse<any>> | null = null;
  private dashboardCache: { data: ApiResponse<any>; timestamp: number } | null = null;
  private readonly DASHBOARD_CACHE_DURATION = 60000; // 1 минута

  // Dashboard API
  async getDashboard(): Promise<ApiResponse<{
    news: Array<{ id: number; title: string; description: string; image: string | null; date: string }>;
    events: Array<{ id: number; title: string; date: string; image: string | null }>;
    courses: Array<{ id: number; name: string; progress: number }>;
    gpa: number;
    attendance: number;
  }>> {
    // Проверяем кеш
    if (this.dashboardCache && 
        Date.now() - this.dashboardCache.timestamp < this.DASHBOARD_CACHE_DURATION) {
      return this.dashboardCache.data;
    }

    // Если уже есть активный запрос, возвращаем его
    if (this.dashboardPromise) {
      return this.dashboardPromise;
    }


    // Создаем новый запрос
    this.dashboardPromise = this.request('/users/dashboard/')
      .then((result) => {
        // Кешируем успешный результат
        if (result.success) {
          this.dashboardCache = {
            data: result,
            timestamp: Date.now()
          };
        }
        
        
        return result;
      })
      .finally(() => {
        // Очищаем промис после завершения
        this.dashboardPromise = null;
      });

    return this.dashboardPromise;
  }

  // Метод для очистки кеша dashboard
  clearDashboardCache(): void {
    this.dashboardCache = null;
    this.dashboardPromise = null;
  }

  async getGrades(): Promise<ApiResponse<any[]>> {
    const result = await this.request<any[]>('/auth/grades/');
    return result;
  }

  async getCourses(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/auth/courses/');
  }

  async getAttendance(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/auth/attendance/');
  }

  // Отдельные методы для получения конкретной новости/события
  async getNewsById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/news/${id}/`);
  }

  async getEventById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/events/${id}/`);
  }
}

export const authApi = new ApiService();
export default ApiService;
