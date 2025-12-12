import { isDebugMode } from '../config/environment';
import { ApiResponse, LDAPCourse, LDAPUserProfile } from '../types';
import { ldapAuthService } from './ldapAuth';

class LDAPDataService {

  private coursesCache: { data: LDAPCourse[]; timestamp: number } | null = null;
  private readonly COURSES_CACHE_DURATION = 300000;

  private profileCache: { data: LDAPUserProfile; timestamp: number } | null = null;
  private readonly PROFILE_CACHE_DURATION = 600000;

  async getStudentProfile(forceRefresh = false): Promise<ApiResponse<LDAPUserProfile>> {

    if (!forceRefresh && this.profileCache &&
        Date.now() - this.profileCache.timestamp < this.PROFILE_CACHE_DURATION) {
      if (isDebugMode()) {
      }
      return {
        success: true,
        data: this.profileCache.data,
      };
    }

    try {
      if (isDebugMode()) {
      }

      const response = await ldapAuthService.getUserProfile();

      if (response.success && response.data) {

        this.profileCache = {
          data: response.data,
          timestamp: Date.now(),
        };

        if (isDebugMode()) {
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

  async getActiveCourses(forceRefresh = false, params?: {
    lang?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{ count: number; data: LDAPCourse[] }>> {

    if (!forceRefresh && this.coursesCache &&
        Date.now() - this.coursesCache.timestamp < this.COURSES_CACHE_DURATION) {
      if (isDebugMode()) {
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
      }

      const response = await ldapAuthService.getActiveCourses(params);

      if (response.success && response.data) {

        this.coursesCache = {
          data: response.data.data || [],
          timestamp: Date.now(),
        };

        if (isDebugMode()) {
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

  async getCourseGrades(): Promise<ApiResponse<any[]>> {
    try {
      if (isDebugMode()) {
      }

      const response = await ldapAuthService.getCourseGrades();

      if (isDebugMode() && response.success) {
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

  async getCourseAttendance(): Promise<ApiResponse<any[]>> {
    try {
      if (isDebugMode()) {
      }

      const response = await ldapAuthService.getCourseAttendance();

      if (isDebugMode() && response.success) {
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
      }
      return {
        success: false,
        error: 'Ошибка получения данных о посещаемости',
      };
    }
  }

  async getMessages(): Promise<ApiResponse<any[]>> {
    try {
      if (isDebugMode()) {
      }

      const response = await ldapAuthService.getMessages();

      if (isDebugMode() && response.success) {
      }

      return response;
    } catch (error) {
      if (isDebugMode()) {
      }
      return {
        success: false,
        error: 'Ошибка получения сообщений',
      };
    }
  }

  async getDashboardData(): Promise<ApiResponse<{
    profile: LDAPUserProfile;
    currentCourses: LDAPCourse[];
    completedCourses: LDAPCourse[];
    grades: any[];
    attendance: any[];
  }>> {
    try {
      if (isDebugMode()) {
      }

      const [profileResponse, coursesResponse, gradesResponse, attendanceResponse] = await Promise.all([
        this.getStudentProfile(),
        this.getActiveCourses(),
        this.getCourseGrades(),
        this.getCourseAttendance(),
      ]);

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

  clearCache(): void {
    this.coursesCache = null;
    this.profileCache = null;

  }

  clearCoursesCache(): void {
    this.coursesCache = null;

  }

  clearProfileCache(): void {
    this.profileCache = null;

  }
}

export const ldapDataService = new LDAPDataService();
export default LDAPDataService;
