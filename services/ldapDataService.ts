import { isDebugMode } from '../config/environment';
import { ApiResponse, LDAPCourse, LDAPUserProfile } from '../types';
import { ldapAuthService } from './ldapAuth';

/**
 * Сервис для работы с LDAP данными студента
 * Предоставляет удобные методы для получения курсов, оценок, посещаемости и т.д.
 */
class LDAPDataService {
  // Кеширование данных курсов
  private coursesCache: { data: LDAPCourse[]; timestamp: number } | null = null;
  private readonly COURSES_CACHE_DURATION = 300000; // 5 минут
  
  // Кеширование профиля пользователя
  private profileCache: { data: LDAPUserProfile; timestamp: number } | null = null;
  private readonly PROFILE_CACHE_DURATION = 600000; // 10 минут

  /**
   * Получить профиль студента с кешированием
   */
  async getStudentProfile(forceRefresh = false): Promise<ApiResponse<LDAPUserProfile>> {
    // Проверяем кеш
    if (!forceRefresh && this.profileCache && 
        Date.now() - this.profileCache.timestamp < this.PROFILE_CACHE_DURATION) {
      if (isDebugMode()) {
        console.log('📋 getStudentProfile: returning cached profile');
      }
      return {
        success: true,
        data: this.profileCache.data,
      };
    }

    try {
      if (isDebugMode()) {
        console.log('📋 Getting student profile from LDAP...');
      }

      const response = await ldapAuthService.getUserProfile();
      
      if (response.success && response.data) {
        // Кешируем результат
        this.profileCache = {
          data: response.data,
          timestamp: Date.now(),
        };
        
        if (isDebugMode()) {
          console.log('✅ Student profile retrieved successfully');
        }
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to get student profile:', error);
      }
      return {
        success: false,
        error: 'Ошибка получения профиля студента',
      };
    }
  }

  /**
   * Получить активные курсы с кешированием
   */
  async getActiveCourses(forceRefresh = false, params?: {
    lang?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{ count: number; data: LDAPCourse[] }>> {
    // Проверяем кеш только если не принудительное обновление
    if (!forceRefresh && this.coursesCache && 
        Date.now() - this.coursesCache.timestamp < this.COURSES_CACHE_DURATION) {
      if (isDebugMode()) {
        console.log('📚 getActiveCourses: returning cached courses');
      }
      return {
        success: true,
        data: {
          count: this.coursesCache.data.length,
          data: this.coursesCache.data,
        },
      };
    }

    try {
      if (isDebugMode()) {
        console.log('📚 Getting active courses from LDAP...');
      }

      const response = await ldapAuthService.getActiveCourses(params);
      
      if (response.success && response.data) {
        // Кешируем курсы
        this.coursesCache = {
          data: response.data.data || [],
          timestamp: Date.now(),
        };
        
        if (isDebugMode()) {
          console.log(`✅ Retrieved ${response.data.count} courses`);
        }
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to get active courses:', error);
      }
      return {
        success: false,
        error: 'Ошибка получения списка курсов',
      };
    }
  }

  /**
   * Получить текущие курсы (только со статусом 'current')
   */
  async getCurrentCourses(forceRefresh = false): Promise<ApiResponse<LDAPCourse[]>> {
    const response = await this.getActiveCourses(forceRefresh);
    
    if (response.success && response.data) {
      const currentCourses = response.data.data.filter(course => course.status === 'current');
      return {
        success: true,
        data: currentCourses,
      };
    }

    return {
      success: false,
      error: response.error || 'Ошибка получения текущих курсов',
    };
  }

  /**
   * Получить завершенные курсы (только со статусом 'past')
   */
  async getCompletedCourses(forceRefresh = false): Promise<ApiResponse<LDAPCourse[]>> {
    const response = await this.getActiveCourses(forceRefresh);
    
    if (response.success && response.data) {
      const completedCourses = response.data.data.filter(course => course.status === 'past');
      return {
        success: true,
        data: completedCourses,
      };
    }

    return {
      success: false,
      error: response.error || 'Ошибка получения завершенных курсов',
    };
  }

  /**
   * Получить оценки по курсам
   */
  async getCourseGrades(): Promise<ApiResponse<any[]>> {
    try {
      if (isDebugMode()) {
        console.log('📊 Getting course grades from LDAP...');
      }

      const response = await ldapAuthService.getCourseGrades();
      
      if (isDebugMode() && response.success) {
        console.log('✅ Course grades retrieved successfully');
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to get course grades:', error);
      }
      return {
        success: false,
        error: 'Ошибка получения оценок',
      };
    }
  }

  /**
   * Получить данные о посещаемости
   */
  async getCourseAttendance(): Promise<ApiResponse<any[]>> {
    try {
      if (isDebugMode()) {
        console.log('📈 Getting course attendance from LDAP...');
      }

      const response = await ldapAuthService.getCourseAttendance();
      
      if (isDebugMode() && response.success) {
        console.log('✅ Course attendance retrieved successfully');
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to get course attendance:', error);
      }
      return {
        success: false,
        error: 'Ошибка получения данных о посещаемости',
      };
    }
  }

  /**
   * Получить сообщения
   */
  async getMessages(): Promise<ApiResponse<any[]>> {
    try {
      if (isDebugMode()) {
        console.log('💬 Getting messages from LDAP...');
      }

      const response = await ldapAuthService.getMessages();
      
      if (isDebugMode() && response.success) {
        console.log('✅ Messages retrieved successfully');
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to get messages:', error);
      }
      return {
        success: false,
        error: 'Ошибка получения сообщений',
      };
    }
  }

  /**
   * Получить сводную информацию для дашборда
   */
  async getDashboardData(): Promise<ApiResponse<{
    profile: LDAPUserProfile;
    currentCourses: LDAPCourse[];
    completedCourses: LDAPCourse[];
    grades: any[];
    attendance: any[];
  }>> {
    try {
      if (isDebugMode()) {
        console.log('📋 Getting dashboard data from LDAP...');
      }

      // Получаем все данные параллельно
      const [profileResponse, coursesResponse, gradesResponse, attendanceResponse] = await Promise.all([
        this.getStudentProfile(),
        this.getActiveCourses(),
        this.getCourseGrades(),
        this.getCourseAttendance(),
      ]);

      // Проверяем, что все основные данные получены
      if (!profileResponse.success || !coursesResponse.success) {
        return {
          success: false,
          error: 'Не удалось получить основные данные профиля',
        };
      }

      const allCourses = coursesResponse.data?.data || [];
      const currentCourses = allCourses.filter(course => course.status === 'current');
      const completedCourses = allCourses.filter(course => course.status === 'past');

      const dashboardData = {
        profile: profileResponse.data!,
        currentCourses,
        completedCourses,
        grades: gradesResponse.success ? gradesResponse.data || [] : [],
        attendance: attendanceResponse.success ? attendanceResponse.data || [] : [],
      };

      if (isDebugMode()) {
        console.log('✅ Dashboard data retrieved successfully:', {
          currentCourses: currentCourses.length,
          completedCourses: completedCourses.length,
          hasGrades: dashboardData.grades.length > 0,
          hasAttendance: dashboardData.attendance.length > 0,
        });
      }

      return {
        success: true,
        data: dashboardData,
      };
    } catch (error) {
      if (isDebugMode()) {
        console.error('❌ Failed to get dashboard data:', error);
      }
      return {
        success: false,
        error: 'Ошибка получения данных дашборда',
      };
    }
  }

  /**
   * Очистить все кеши
   */
  clearCache(): void {
    this.coursesCache = null;
    this.profileCache = null;
    
    if (isDebugMode()) {
      console.log('🧹 LDAP data cache cleared');
    }
  }

  /**
   * Очистить кеш курсов
   */
  clearCoursesCache(): void {
    this.coursesCache = null;
    
    if (isDebugMode()) {
      console.log('🧹 LDAP courses cache cleared');
    }
  }

  /**
   * Очистить кеш профиля
   */
  clearProfileCache(): void {
    this.profileCache = null;
    
    if (isDebugMode()) {
      console.log('🧹 LDAP profile cache cleared');
    }
  }
}

// Экспортируем singleton instance
export const ldapDataService = new LDAPDataService();
export default LDAPDataService;
