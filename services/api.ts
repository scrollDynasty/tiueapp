import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginCredentials, User } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
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
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        data: data.data || data,
      };

      if (result.success && result.data) {
        await AsyncStorage.setItem('authToken', result.data.token);
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
    await AsyncStorage.removeItem('authToken');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me/');
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
                  const timestamp = Date.now();
                  const filename = `event_${timestamp}.jpg`;
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
    return this.request<void>(`/events/${eventId}/`, {
      method: 'DELETE',
    });
  }
}

export const authApi = new ApiService();
export default ApiService;
