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
      
      console.log('API Request:', {
        url,
        method: options.method || 'GET',
        headers,
        body: options.body
      });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

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
      console.error('API Error:', error);
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
      
      console.log('Login API Response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      const result = {
        success: true,
        data: data.data || data,
      };

      if (result.success && result.data) {
        console.log('Saving token:', result.data.token);
        await AsyncStorage.setItem('authToken', result.data.token);
        
        // Проверим, что токен действительно сохранился
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log('Token saved successfully:', savedToken === result.data.token);
      }

      return result;
    } catch (error) {
      console.error('Login API Error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    // Optional: call backend logout endpoint
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch (error) {
      // Ignore errors during logout
    }
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
    console.log('=== CREATE NEWS START ===');
    console.log('Raw newsData received:', JSON.stringify(newsData, null, 2));
    
    // Если есть изображение, конвертируем его в base64 и отправляем как JSON
    if (newsData.image) {
      try {
        console.log('=== IMAGE UPLOAD MODE ===');
        console.log('Original image data:', newsData.image);
        
        // Получаем URI изображения
        const imageUri = newsData.image.uri || newsData.image;
        console.log('Image URI:', imageUri);
        
        // Конвертируем изображение в base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        console.log('Base64 image length:', base64.length);
        
        // Отправляем как JSON с base64 изображением
        const requestData = {
          ...newsData,
          image_base64: base64,
        };
        delete requestData.image; // Удаляем оригинальный объект image
        
        console.log('Sending JSON request with base64 image');
        
        return this.request<any>('/news/', {
          method: 'POST',
          body: JSON.stringify(requestData),
        });
      } catch (error) {
        console.error('Base64 conversion error:', error);
        return {
          success: false,
          error: 'Failed to process image',
        };
      }
    } else {
      console.log('=== JSON MODE (NO IMAGE) ===');
      // Без изображения отправляем как JSON
      return this.request<any>('/news/', {
        method: 'POST',
        body: JSON.stringify(newsData),
      });
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
    return this.request<any>('/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
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
