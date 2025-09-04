import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginCredentials, User } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
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
    const response = await this.request<{ user: User; token: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      console.log('Saving token:', response.data.token);
      await AsyncStorage.setItem('authToken', response.data.token);
      
      // Проверим, что токен действительно сохранился
      const savedToken = await AsyncStorage.getItem('authToken');
      console.log('Token saved successfully:', savedToken === response.data.token);
    }

    return response;
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
}

export const authApi = new ApiService();
export default ApiService;
