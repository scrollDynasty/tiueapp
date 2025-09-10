import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/environment';
import { ApiResponse, LoginCredentials, User } from '../types';

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    // Даем время AsyncStorage обновиться
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔑 Token from storage:', token ? `${token.substring(0, 10)}...` : 'No token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Пропускает предупреждение ngrok
    };
    
    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `Token ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No valid token found');
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
      
      console.log(`🌐 Making request to: ${url}`);
      console.log(`📋 Headers:`, JSON.stringify(finalHeaders, null, 2));
      
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      console.log(`📡 Response status: ${response.status}`);
      
      const data = await response.json();

      if (!response.ok) {
        console.log(`❌ Request failed: ${response.status} - ${data.error || data.message}`);
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

    console.log('🌐 Login response status:', response.status);
    console.log('🌐 Login response headers:', Object.fromEntries(response.headers.entries()));

    try {
      const data = await response.json();
      console.log('📦 Raw server response:', JSON.stringify(data, null, 2));

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
      
      console.log('🔍 Processed result:', JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        console.log('💾 Saving token to storage:', result.data.token ? `${result.data.token.substring(0, 10)}...` : 'No token');
        console.log('🔍 Full token being saved:', result.data.token);
        
        // ПОЛНАЯ очистка AsyncStorage перед сохранением нового токена
        console.log('🧹 Completely clearing AsyncStorage...');
        await AsyncStorage.clear();
        await new Promise(resolve => setTimeout(resolve, 100)); // Даем время на очистку
        
        await AsyncStorage.setItem('authToken', result.data.token);
        
        // Проверяем, что токен действительно сохранился
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log('✅ Token saved successfully:', savedToken ? `${savedToken.substring(0, 10)}...` : 'Failed to save');
        console.log('🔍 Full saved token:', savedToken);
        
        // Двойная проверка - убеждаемся что токен правильный
        if (savedToken !== result.data.token) {
          console.error('❌ Token mismatch! Expected:', result.data.token.substring(0, 10), 'Got:', savedToken?.substring(0, 10));
          console.error('❌ Full expected token:', result.data.token);
          console.error('❌ Full saved token:', savedToken);
          // Пробуем сохранить еще раз
          await AsyncStorage.setItem('authToken', result.data.token);
          const retryToken = await AsyncStorage.getItem('authToken');
          console.log('🔄 Retry save result:', retryToken ? `${retryToken.substring(0, 10)}...` : 'Still failed');
          console.log('🔄 Full retry token:', retryToken);
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
    console.log('🗑️ Clearing token from storage');
    await AsyncStorage.removeItem('authToken');
    console.log('✅ Token cleared successfully');
  }

  // Добавляем функцию для принудительной очистки storage
  async clearStorage(): Promise<void> {
    console.log('🧹 Clearing all AsyncStorage');
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage cleared');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    console.log('👤 Getting current user...');
    const result = await this.request<User>('/auth/me/');
    console.log('👤 getCurrentUser result:', result.success ? 'Success' : `Failed: ${result.error}`);
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

        // Создаем изображение для получения правильных данных
        const imageUri = newsData.image.uri;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const imageFile = await new Promise<File>((resolve, reject) => {
          img.onload = () => {
            // Создаем canvas для правильной обработки изображения
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              
              // Конвертируем в blob с правильным MIME типом
              canvas.toBlob((blob) => {
                if (blob) {
                  const timestamp = Date.now();
                  const filename = `news_${timestamp}.jpg`;
                  const file = new File([blob], filename, { type: 'image/jpeg' });
                  resolve(file);
                } else {
                  reject(new Error('Failed to create blob'));
                }
              }, 'image/jpeg', 0.8);
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUri;
        });
        
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

      // Если есть изображение, используем FormData
      if (eventData.image) {
        const formData = new FormData();
        
        // Добавляем все поля события
        formData.append('title', eventData.title);
        formData.append('description', eventData.description);
        formData.append('location', eventData.location);
        formData.append('date', eventData.date);
        formData.append('time', eventData.time);
        formData.append('category', eventData.category);
        if (eventData.max_participants) {
          formData.append('max_participants', eventData.max_participants.toString());
        }

        // Для React Native Web создаем File объект правильно
        const imageUri = eventData.image.uri;
        
        // Создаем изображение для получения правильных данных
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const imageFile = await new Promise<File>((resolve, reject) => {
          img.onload = () => {
            // Создаем canvas для правильной обработки изображения
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              
              // Конвертируем в blob с правильным MIME типом
              canvas.toBlob((blob) => {
                if (blob) {
                  // Создаем короткое уникальное имя файла (в пределах 100 символов)
                  const now = new Date();
                  const dateStr = now.getFullYear().toString().slice(-2) + 
                                 (now.getMonth() + 1).toString().padStart(2, '0') + 
                                 now.getDate().toString().padStart(2, '0');
                  const timeStr = now.getHours().toString().padStart(2, '0') + 
                                 now.getMinutes().toString().padStart(2, '0') + 
                                 now.getSeconds().toString().padStart(2, '0');
                  const randomStr = Math.random().toString(36).substring(2, 8);
                  const filename = `evt_${dateStr}_${timeStr}_${randomStr}.jpg`;
                  console.log('Generated filename:', filename, 'Length:', filename.length);
                  const file = new File([blob], filename, { type: 'image/jpeg' });
                  resolve(file);
                } else {
                  reject(new Error('Failed to create blob'));
                }
              }, 'image/jpeg', 0.8);
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageUri;
        });
        
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
      console.log('🔧 API deleteEvent: Starting delete for ID:', eventId);
      
      const token = await AsyncStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers.Authorization = `Token ${token}`;
      }
      
      const url = `${API_BASE_URL}/events/${eventId}/`;
      
      console.log('🔧 API deleteEvent: Making request to:', url);
      console.log('🔧 API deleteEvent: Headers:', headers);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      console.log('🔧 API deleteEvent: Response status:', response.status);
      console.log('🔧 API deleteEvent: Response ok:', response.ok);

      // DELETE возвращает 204 без контента, поэтому не парсим JSON
      if (response.ok) {
        console.log('🔧 API deleteEvent: Success, returning');
        return {
          success: true,
          data: undefined as any,
        };
      } else {
        console.log('🔧 API deleteEvent: Response not ok, trying to parse error');
        // Только если есть ошибка, пытаемся парсить JSON
        try {
          const data = await response.json();
          console.log('🔧 API deleteEvent: Error data:', data);
          return {
            success: false,
            error: data.error || data.message || `HTTP ${response.status}`,
          };
        } catch (parseError) {
          console.log('🔧 API deleteEvent: Failed to parse error JSON:', parseError);
          return {
            success: false,
            error: `HTTP ${response.status}`,
          };
        }
      }
    } catch (error) {
      console.log('🔧 API deleteEvent: Caught exception:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }
}

export const authApi = new ApiService();
export default ApiService;
