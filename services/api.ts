import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/environment';
import { ApiResponse, LoginCredentials, User } from '../types';

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    // Даем время AsyncStorage обновиться
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = await AsyncStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Пропускает предупреждение ngrok
    };
    
    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `Token ${token}`;
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
    // Для login запроса НЕ используем getHeaders (там может быть недействительный токен)
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/auth/login/?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify(credentials),
    });


    try {
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Ошибка входа';
        
        if (response.status === 401) {
          errorMessage = 'Неверный email или пароль';
        } else if (response.status === 400) {
          errorMessage = data.error || data.message || 'Некорректные данные для входа';
        } else if (response.status === 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        } else if (response.status >= 500) {
          errorMessage = 'Сервер временно недоступен';
        } else {
          errorMessage = data.error || data.message || `Ошибка ${response.status}`;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      const result = {
        success: true,
        data: data.data, // Всегда используем data.data для login endpoint
      };
      

      if (result.success && result.data) {
        if (__DEV__) {
          console.log('💾 Saving token to storage:', result.data.token ? `${result.data.token.substring(0, 10)}...` : 'No token');
          // SECURITY: Never log full tokens, even in dev
        }
        
        // ПОЛНАЯ очистка AsyncStorage перед сохранением нового токена
        if (__DEV__) {
          console.log('🧹 Completely clearing AsyncStorage...');
        }
        await AsyncStorage.clear();
        await new Promise(resolve => setTimeout(resolve, 100)); // Даем время на очистку
        
        await AsyncStorage.setItem('authToken', result.data.token);
        
        // Проверяем, что токен действительно сохранился
        const savedToken = await AsyncStorage.getItem('authToken');
        if (__DEV__) {
          console.log('✅ Token saved successfully:', savedToken ? `${savedToken.substring(0, 10)}...` : 'Failed to save');
        }
        
        // Двойная проверка - убеждаемся что токен правильный
        if (savedToken !== result.data.token) {
          if (__DEV__) {
            console.error('❌ Token mismatch! Expected:', result.data.token.substring(0, 10), 'Got:', savedToken?.substring(0, 10));
          }
          // Пробуем сохранить еще раз
          await AsyncStorage.setItem('authToken', result.data.token);
          const retryToken = await AsyncStorage.getItem('authToken');
          if (__DEV__) {
            console.log('🔄 Retry save result:', retryToken ? `${retryToken.substring(0, 10)}...` : 'Still failed');
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Проблема с подключением к серверу',
      };
    }
  }

  async logout(): Promise<void> {
    // Optional: call backend logout endpoint BEFORE removing token
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch (error) {
      // Ignore errors during logout
    }
    // Remove token from storage after backend call (or if it fails)
    if (__DEV__) {
      console.log('🗑️ Clearing token from storage');
    }
    await AsyncStorage.removeItem('authToken');
    if (__DEV__) {
      console.log('✅ Token cleared successfully');
    }
  }

  // Добавляем функцию для принудительной очистки storage
  async clearStorage(): Promise<void> {
    if (__DEV__) {
      console.log('🧹 Clearing all AsyncStorage');
    }
    await AsyncStorage.clear();
    if (__DEV__) {
      console.log('✅ AsyncStorage cleared');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (__DEV__) {
      console.log('👤 Getting current user...');
    }
    const result = await this.request<User>('/auth/me/');
    if (__DEV__) {
      console.log('👤 getCurrentUser result:', result.success ? 'Success' : `Failed: ${result.error}`);
    }
    return result;
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
            'Authorization': token ? `Token ${token}` : '',
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

      // Log intent
      if (__DEV__) {
        console.log('🆕 createEvent(): preparing payload', {
          hasImage: !!eventData.image,
          title: eventData?.title,
        });
      }

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
        if (__DEV__) {
          console.log('🖼 createEvent(): image object', eventData.image);
        }
        if (!imageUri) {
          if (__DEV__) {
            console.warn('⚠️ createEvent(): image object missing uri');
          }
        } else if (imageUri.startsWith('/')) {
          // Normalize plain path to file:// for Android
            imageUri = 'file://' + imageUri;
            if (__DEV__) {
              console.log('🛠 createEvent(): normalized uri ->', imageUri);
            }
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
        if (__DEV__) {
          console.log('📤 createEvent(): added image object', { name: filename, uri: imageUri });
        }

        if (__DEV__) {
          console.log('📤 createEvent(): sending multipart request', { url });
        }

        let apiResponse: Response;
        try {
          apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': token ? `Token ${token}` : '',
            },
            body: formData,
          });
        } catch (networkErr: any) {
          if (__DEV__) {
            console.error('🌐 createEvent(): network layer failure', networkErr?.message || networkErr);
            console.log('💡 Hint: If using ngrok, ensure tunnel is active and device can reach it (same Wi-Fi, not asleep).');
            console.log('↩️ Fallback: try create WITHOUT image');
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

        if (__DEV__) {
          console.log('✅ createEvent(): success (multipart)');
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
      if (__DEV__) {
        console.log('🔧 API deleteEvent: Starting delete for ID:', eventId);
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers.Authorization = `Token ${token}`;
      }
      
      const url = `${API_BASE_URL}/events/${eventId}/`;
      
      if (__DEV__) {
        console.log('🔧 API deleteEvent: Making request to:', url);
        console.log('🔧 API deleteEvent: Headers:', headers);
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      if (__DEV__) {
        console.log('🔧 API deleteEvent: Response status:', response.status);
        console.log('🔧 API deleteEvent: Response ok:', response.ok);
      }

      // DELETE возвращает 204 без контента, поэтому не парсим JSON
      if (response.ok) {
        if (__DEV__) {
          console.log('🔧 API deleteEvent: Success, returning');
        }
        return {
          success: true,
          data: undefined as any,
        };
      } else {
        if (__DEV__) {
          console.log('🔧 API deleteEvent: Response not ok, trying to parse error');
        }
        // Только если есть ошибка, пытаемся парсить JSON
        try {
          const data = await response.json();
          if (__DEV__) {
            console.log('🔧 API deleteEvent: Error data:', data);
          }
          return {
            success: false,
            error: data.error || data.message || `HTTP ${response.status}`,
          };
        } catch (parseError) {
          if (__DEV__) {
            console.log('🔧 API deleteEvent: Failed to parse error JSON:', parseError);
          }
          return {
            success: false,
            error: `HTTP ${response.status}`,
          };
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.log('🔧 API deleteEvent: Caught exception:', error);
      }
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }
}

export const authApi = new ApiService();
export default ApiService;
