import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApiBaseUrl } from '../config/environment';
import { ApiResponse, LoginCredentials, User } from '../types';
import { cache, cacheKeys, cacheTTL, withCache } from '../utils/cache';

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {

    await new Promise(resolve => setTimeout(resolve, 100));

    let token = await AsyncStorage.getItem('ldap_access_token');
    let authType = 'Bearer';

    if (!token || token === 'undefined' || token === 'null') {
      token = await AsyncStorage.getItem('adminToken');
      authType = 'Token';
    }

    if (!token || token === 'undefined' || token === 'null') {
      token = await AsyncStorage.getItem('authToken');
      authType = 'Bearer';
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `${authType} ${token}`;
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

      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      const data = await response.json();

      if (!response.ok) {

        let errorMessage = 'Неизвестная ошибка';

        if (response.status === 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже или обратитесь к администратору.';
        } else if (response.status === 403) {
          errorMessage = 'Недостаточно прав доступа. Проверьте авторизацию.';
        } else if (response.status === 401) {
          errorMessage = 'Требуется авторизация. Войдите в систему заново.';
        } else if (response.status === 400) {
          errorMessage = data.error || 'Некорректные данные запроса';
        } else {
          errorMessage = data.error || data.message || `Ошибка ${response.status}`;
        }

        console.error('API Error:', { status: response.status, data, url: response.url });

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: data.data || data,
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

      if (!data.success || !data.data) {
        return {
          success: false,
          error: data.error || 'Неверный формат ответа сервера',
        };
      }

      const { access_token, refresh_token, user: ldapProfile, auth_type } = data.data;

      let user: User;
      let username: string;

      if (auth_type === 'local' && ldapProfile) {

        username = ldapProfile.username;

        let avatarUrl = null;
        try {
          const avatarResponse = await this.getUserAvatar(username);
          if (avatarResponse.success && avatarResponse.data?.avatar_url) {
            avatarUrl = avatarResponse.data.avatar_url;
          }
        } catch (error) {

        }

        user = {
          id: ldapProfile.id,
          username: username,
          email: ldapProfile.email || '',
          first_name: ldapProfile.first_name || '',
          last_name: ldapProfile.last_name || '',
          role: ldapProfile.role || 'admin',
          is_active: true,
          created_at: ldapProfile.created_at || new Date().toISOString(),
          updated_at: ldapProfile.updated_at || new Date().toISOString(),
          avatar: avatarUrl || undefined,
        };

        await AsyncStorage.setItem('adminToken', access_token);

      } else if (ldapProfile) {

        username = credentials.username;

        let avatarUrl = null;
        try {
          const avatarResponse = await this.getUserAvatar(username);
          if (avatarResponse.success && avatarResponse.data?.avatar_url) {
            avatarUrl = avatarResponse.data.avatar_url;
          }
        } catch (error) {

        }

        user = {
          id: ldapProfile.jshr || credentials.username,
          username: username,
          email: ldapProfile.email || `${credentials.username}@tiue.uz`,
          first_name: this.extractFirstName(ldapProfile.full_name || ''),
          last_name: this.extractLastName(ldapProfile.full_name || ''),
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar: avatarUrl || undefined,

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

        username = credentials.username;

        let avatarUrl = null;
        try {
          const avatarResponse = await this.getUserAvatar(username);
          if (avatarResponse.success && avatarResponse.data?.avatar_url) {
            avatarUrl = avatarResponse.data.avatar_url;
          }
        } catch (error) {

        }

        user = {
          id: credentials.username,
          username: username,
          email: `${credentials.username}@tiue.uz`,
          first_name: '',
          last_name: '',
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar: avatarUrl || undefined,
        };
      }

      await Promise.all([
        AsyncStorage.setItem('authToken', access_token),
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

  private extractFirstName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');

    const firstName = parts[1] || '';
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }

  private extractLastName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');

    const lastName = parts[0] || '';
    return lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  }

  private extractCourseFromGroup(groupName: string): number {
    if (!groupName) return 1;

    const match = groupName.match(/-(\d{2})-/);
    if (match) {
      const year = parseInt(match[1]);
      const currentYear = 25;
      return Math.max(1, currentYear - year + 1);
    }
    return 1;
  }

  async logout(): Promise<void> {
    try {

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

    this.clearUserCache();
    this.clearDashboardCache();

  }

  async clearStorage(): Promise<void> {

    await Promise.all([
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('ldap_access_token'),
      AsyncStorage.removeItem('ldap_refresh_token'),
    ]);

    this.clearUserCache();
    this.clearDashboardCache();

  }

  private currentUserPromise: Promise<ApiResponse<User>> | null = null;
  private currentUserCache: { data: ApiResponse<User>; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 30000;

  async getCurrentUser(): Promise<ApiResponse<User>> {

    if (this.currentUserCache &&
        Date.now() - this.currentUserCache.timestamp < this.CACHE_DURATION) {
      return this.currentUserCache.data;
    }

    if (this.currentUserPromise) {

      return this.currentUserPromise;
    }

    this.currentUserPromise = this.getLDAPCurrentUser()
      .then((result) => {

        if (result.success) {
          this.currentUserCache = {
            data: result,
            timestamp: Date.now()
          };
        }

        return result;
      })
      .finally(() => {

        this.currentUserPromise = null;
      });

    return this.currentUserPromise;
  }

  private async getLDAPCurrentUser(): Promise<ApiResponse<User>> {
    try {

      let token = await AsyncStorage.getItem('ldap_access_token');
      let authType = 'Bearer';
      let isLocalAdmin = false;

      if (!token || token === 'undefined' || token === 'null') {
        token = await AsyncStorage.getItem('adminToken');
        authType = 'Token';
        isLocalAdmin = true;
      }

      if (!token || token === 'undefined' || token === 'null') {
        token = await AsyncStorage.getItem('authToken');
        authType = 'Bearer';
      }

      if (!token || token === 'undefined' || token === 'null') {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const endpoint = isLocalAdmin ? '/auth/me/' : '/auth/me/';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${authType} ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {

        if (response.status === 401) {

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

      let user: User;
      let username: string;

      if (isLocalAdmin) {

        const adminData = data.data.user;
        username = adminData.username;

        let avatarUrl = null;
        try {
          const avatarResponse = await this.getUserAvatar(username);
          if (avatarResponse.success && avatarResponse.data?.avatar_url) {
            avatarUrl = avatarResponse.data.avatar_url;
          }
        } catch (error) {

        }

        user = {
          id: adminData.id,
          username: username,
          email: adminData.email || '',
          first_name: adminData.first_name || '',
          last_name: adminData.last_name || '',
          role: adminData.role || 'admin',
          is_active: true,
          created_at: adminData.created_at || new Date().toISOString(),
          updated_at: adminData.updated_at || new Date().toISOString(),
          avatar: avatarUrl || undefined,
        };
      } else {

        const ldapProfile = data.data;
        username = ldapProfile.email ? ldapProfile.email.split('@')[0] : 'unknown';

        let avatarUrl = null;
        try {
          const avatarResponse = await this.getUserAvatar(username);
          if (avatarResponse.success && avatarResponse.data?.avatar_url) {
            avatarUrl = avatarResponse.data.avatar_url;
          }
        } catch (error) {

        }

        user = {
          id: ldapProfile.jshr || 'unknown',
          username: username,
          email: ldapProfile.email || '',
          first_name: this.extractFirstName(ldapProfile.full_name || ''),
          last_name: this.extractLastName(ldapProfile.full_name || ''),
          role: 'student',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar: avatarUrl || undefined,

          ldap_profile: ldapProfile,
          student: {
            group: {
              name: ldapProfile.group || '',
              course: this.extractCourseFromGroup(ldapProfile.group || ''),
            },
            course: this.extractCourseFromGroup(ldapProfile.group || ''),
          },
        };
      }

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

  clearUserCache(): void {
    this.currentUserCache = null;
    this.currentUserPromise = null;
  }

  async uploadAvatar(imageData: any): Promise<ApiResponse<{ avatar_url: string }>> {
    try {
      if (!imageData.uri) {
        return {
          success: false,
          error: 'Изображение не выбрано',
        };
      }

      const url = `${API_BASE_URL}/users/avatar/`;
      const formData = new FormData();

      const timestamp = Date.now();
      const filename = `avatar_${timestamp}.jpg`;

      if (Platform.OS === 'web') {

        const response = await fetch(imageData.uri);
        const blob = await response.blob();
        formData.append('avatar', blob, filename);
      } else {

        let fileType = imageData.type || 'image/jpeg';
        if (fileType === 'image') {

          const extension = imageData.uri.toLowerCase().split('.').pop();
          if (extension === 'png') {
            fileType = 'image/png';
          } else if (extension === 'webp') {
            fileType = 'image/webp';
          } else {
            fileType = 'image/jpeg';
          }
        }

        const fileToUpload = {
          uri: imageData.uri,
          type: fileType,
          name: filename,
        };

        formData.append('avatar', fileToUpload);
      }

      const headers = await this.getHeaders();

      delete headers['Content-Type'];

      if (Platform.OS !== 'web') {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();

          xhr.onload = () => {

            try {
              const data = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                  success: true,
                  data: data.data || data,
                });
              } else {
                resolve({
                  success: false,
                  error: data.error || data.message || 'Ошибка загрузки аватара',
                });
              }
            } catch (parseError) {
              resolve({
                success: false,
                error: 'Неверный формат ответа сервера',
              });
            }
          };

          xhr.onerror = () => {
            resolve({
              success: false,
              error: 'Ошибка сети при загрузке аватара',
            });
          };

          xhr.ontimeout = () => {
            resolve({
              success: false,
              error: 'Превышено время ожидания',
            });
          };

          xhr.open('POST', url);
          xhr.timeout = 30000;

          Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
          });

          xhr.send(formData);
        });
      }

      const apiResponse = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Ошибка загрузки аватара',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };

    } catch (error) {
      return {
        success: false,
        error: 'Ошибка загрузки аватара',
      };
    }
  }

  async getUserAvatar(username: string): Promise<ApiResponse<{ avatar_url: string | null; initials: string }>> {
    return this.request<{ avatar_url: string | null; initials: string }>(`/users/avatar/${username}/`);
  }

  async searchStudents(params: {
    query?: string;
    course?: number;
    group?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();

    if (params.query) {
      searchParams.append('q', params.query);
    }
    if (params.course) {
      searchParams.append('course', params.course.toString());
    }
    if (params.group) {
      searchParams.append('group', params.group);
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/auth/search/students/${queryString ? `?${queryString}` : ''}`;

    return this.request<any[]>(endpoint);
  }

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

  async getGroups(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/groups/');
  }

  async createGroup(groupData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/groups/', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

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

  async getNews(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/news/');
  }

  async createNews(newsData: any): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `${API_BASE_URL}/news/`;

      if (newsData.image) {
        const formData = new FormData();

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

        if (!imageUri) {
          console.warn('Image URI is missing, skipping image upload');
        } else {

          const imageFile = {
            uri: imageUri,
            type: newsData.image.type || 'image/jpeg',
            name: filename,
          } as any;

          formData.append('image', imageFile);
          console.log('Image added to FormData:', { uri: imageUri, name: filename });
        }

        const apiResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',

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

            imageUri = 'file://' + imageUri;
        }

        const now = new Date();
        const filename = `evt_${now.getTime()}.jpg`;

        if (!imageUri) {
          console.warn('Event image URI is missing, skipping image upload');
        } else {

          const imageFile = {
            uri: imageUri,
            type: eventData.image.type || 'image/jpeg',
            name: filename,
          } as any;

          formData.append('image', imageFile);
          console.log('Event image added to FormData:', { uri: imageUri, name: filename });
        }

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

      if (response.ok) {
        return {
          success: true,
          data: undefined as any,
        };
      } else {

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

  private dashboardPromise: Promise<ApiResponse<any>> | null = null;
  private dashboardCache: { data: ApiResponse<any>; timestamp: number } | null = null;
  private readonly DASHBOARD_CACHE_DURATION = 60000;

  async getDashboard(): Promise<ApiResponse<{
    news: Array<{ id: number; title: string; description: string; image: string | null; date: string }>;
    events: Array<{ id: number; title: string; date: string; image: string | null }>;
    courses: Array<{ id: number; name: string; progress: number }>;
    gpa: number;
    attendance: number;
  }>> {

    if (this.dashboardCache &&
        Date.now() - this.dashboardCache.timestamp < this.DASHBOARD_CACHE_DURATION) {
      return this.dashboardCache.data;
    }

    if (this.dashboardPromise) {
      return this.dashboardPromise;
    }

    this.dashboardPromise = this.request('/users/dashboard/')
      .then((result) => {

        if (result.success) {
          this.dashboardCache = {
            data: result,
            timestamp: Date.now()
          };
        }

        return result;
      })
      .finally(() => {

        this.dashboardPromise = null;
      });

    return this.dashboardPromise;
  }

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

  async getNewsById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/news/${id}/`);
  }

  async getEventById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/events/${id}/`);
  }
}

export const authApi = new ApiService();
export default ApiService;
