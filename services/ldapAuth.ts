import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    buildLDAPUrl,
    getLDAPEndpoint,
    isDebugMode
} from '../config/environment';
import {
    ApiResponse,
    LDAPCourse,
    LDAPLoginResponse,
    LDAPRefreshRequest,
    LDAPUserProfile,
    LoginCredentials
} from '../types';

class LDAPAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenRefreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.initializeTokens();
  }

  private async initializeTokens(): Promise<void> {
    try {
      const [access, refresh] = await Promise.all([
        AsyncStorage.getItem('ldap_access_token'),
        AsyncStorage.getItem('ldap_refresh_token')
      ]);
      
      this.accessToken = access;
      this.refreshToken = refresh;
      
      if (isDebugMode()) {
      }
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to initialize LDAP tokens:', error);
      }
    }
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {


      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        if (isDebugMode()) {
          console.error('❌ LDAP API Error:', { status: response.status, error: errorMessage });
        }
        return {
          success: false,
          error: errorMessage,
        };
      }


      return {
        success: true,
        data: data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      if (isDebugMode()) {
        console.error('❌ LDAP Network Error:', errorMessage);
      }
      return {
        success: false,
        error: 'Проблема с подключением к серверу',
      };
    }
  }

  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Получаем актуальный токен (с автоматическим обновлением если нужно)
    const token = await this.getValidAccessToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Не удалось получить токен авторизации',
      };
    }

    return this.makeRequest<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  private async getValidAccessToken(): Promise<string | null> {
    // Если токен есть и он свежий, возвращаем его
    if (this.accessToken && this.isTokenValid(this.accessToken)) {
      return this.accessToken;
    }

    // Если уже идет процесс обновления токена, ждем его
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // Запускаем обновление токена
    this.tokenRefreshPromise = this.refreshAccessToken();
    const newToken = await this.tokenRefreshPromise;
    this.tokenRefreshPromise = null;
    
    return newToken;
  }

  private isTokenValid(token: string): boolean {
    try {
      // JWT токен состоит из трех частей, разделенных точками
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Декодируем payload (вторая часть)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Проверяем, что токен не истек (с запасом 5 минут)
      return payload.exp && payload.exp > (currentTime + 300);
    } catch (error) {
      if (isDebugMode()) {
        console.warn('⚠️ Failed to validate token:', error);
      }
      return false;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {

      const refreshData: LDAPRefreshRequest = {
        refresh_token: this.refreshToken,
      };

      const response = await this.makeRequest<{ access_token: string; refresh_token: string }>(
        getLDAPEndpoint('REFRESH'),
        {
          method: 'POST',
          body: JSON.stringify(refreshData),
        }
      );

      if (response.success && response.data?.access_token) {
        this.accessToken = response.data.access_token;
        
        // Обновляем refresh token если он пришел в ответе
        if (response.data.refresh_token) {
          this.refreshToken = response.data.refresh_token;
          await AsyncStorage.setItem('ldap_refresh_token', this.refreshToken);
        }
        
        await AsyncStorage.setItem('ldap_access_token', this.accessToken);
        
        
        return this.accessToken;
      } else {
        if (isDebugMode()) {
          console.error('❌ Failed to refresh token:', response.error);
        }
        // Очищаем невалидные токены
        await this.clearTokens();
        return null;
      }
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Token refresh error:', error);
      }
      await this.clearTokens();
      return null;
    }
  }

  // Публичные методы для авторизации

  async login(credentials: LoginCredentials): Promise<ApiResponse<LDAPLoginResponse>> {
    try {

      const response = await this.makeRequest<LDAPLoginResponse>(
        getLDAPEndpoint('LOGIN'),
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );

      if (response.success && response.data) {
        // Сохраняем токены
        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;

        await Promise.all([
          AsyncStorage.setItem('ldap_access_token', this.accessToken),
          AsyncStorage.setItem('ldap_refresh_token', this.refreshToken),
        ]);

      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ LDAP login error:', error);
      }
      return {
        success: false,
        error: 'Ошибка авторизации',
      };
    }
  }

  async logout(): Promise<void> {


    await this.clearTokens();
  }

  private async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenRefreshPromise = null;

    try {
      await Promise.all([
        AsyncStorage.removeItem('ldap_access_token'),
        AsyncStorage.removeItem('ldap_refresh_token'),
      ]);
      
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to clear tokens:', error);
      }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getValidAccessToken();
    return !!token;
  }

  // Методы для работы с LDAP API

  async getUserProfile(): Promise<ApiResponse<LDAPUserProfile>> {
    return this.makeAuthenticatedRequest<LDAPUserProfile>(
      getLDAPEndpoint('PROFILE'),
      { method: 'POST' }
    );
  }

  async getActiveCourses(params?: {
    lang?: string;
    page?: number;
    pageSize?: number;
    skip?: number;
    take?: number;
  }): Promise<ApiResponse<{ count: number; data: LDAPCourse[] }>> {
    const defaultParams = {
      lang: 'en',
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
      ...params,
    };

    const url = buildLDAPUrl('COURSES', {
      lang: defaultParams.lang,
      page: defaultParams.page.toString(),
      pageSize: defaultParams.pageSize.toString(),
      skip: defaultParams.skip.toString(),
      take: defaultParams.take.toString(),
    });

    return this.makeAuthenticatedRequest<{ count: number; data: LDAPCourse[] }>(url, {
      method: 'GET',
    });
  }

  async getCourseGrades(): Promise<ApiResponse<any[]>> {
    return this.makeAuthenticatedRequest<any[]>(
      getLDAPEndpoint('GRADES'),
      { method: 'GET' }
    );
  }

  async getCourseAttendance(): Promise<ApiResponse<any[]>> {
    return this.makeAuthenticatedRequest<any[]>(
      getLDAPEndpoint('ATTENDANCE'),
      { method: 'GET' }
    );
  }

  async getMessages(): Promise<ApiResponse<any[]>> {
    return this.makeAuthenticatedRequest<any[]>(
      getLDAPEndpoint('MESSAGES'),
      { method: 'POST' }
    );
  }

  async uploadImage(imageData: any): Promise<ApiResponse<any>> {
    const token = await this.getValidAccessToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Не удалось получить токен авторизации',
      };
    }

    try {
      const response = await fetch(getLDAPEndpoint('IMAGE'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: imageData, // FormData for image upload
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
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка загрузки изображения',
      };
    }
  }
}

// Экспортируем singleton instance
export const ldapAuthService = new LDAPAuthService();
export default LDAPAuthService;
