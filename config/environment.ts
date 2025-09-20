
export interface EnvironmentConfig {
  API_BASE_URL: string;
  WS_BASE_URL?: string;
  DEBUG?: boolean;
}

const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'http://38.226.16.117:4343/api',
  WS_BASE_URL: 'ws://38.226.16.117:4343/ws',
  DEBUG: true,
};

const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://my.tiue.uz/api',
  WS_BASE_URL: 'wss://my.tiue.uz/ws',
  DEBUG: false,
};

// LDAP Mobile API Configuration
const ldapConfig = {
  // Базовый URL для LDAP API (без /api в конце)
  LDAP_BASE_URL: 'https://my.tiue.uz',
  // Endpoints для мобильного API
  ENDPOINTS: {
    LOGIN: '/mobile/login',
    REFRESH: '/mobile/refresh',
    PROFILE: '/mobile/data-student-profile',
    COURSES: '/mobile/active-course-list',
    GRADES: '/mobile/course-grades-list',
    ATTENDANCE: '/mobile/course-attendance-list',
    MESSAGES: '/mobile/messages-list',
    IMAGE: '/mobile/img',
  }
};

// 📝 Конфигурация API:
// 1. Production: используется https://my.tiue.uz
// 2. Development: используется localhost:8000
// 3. forceProduction = false для использования локального сервера для разработки

// Определяем, находимся ли мы в режиме разработки
// __DEV__ автоматически определяется React Native
// Добавляем флаг для принудительного использования продакшн режима
const forceProduction = false; // Установите false для использования локального сервера
const isDevelopment = forceProduction ? false : (__DEV__ ?? true);

// Экспортируем конфигурацию в зависимости от окружения
export const config: EnvironmentConfig = isDevelopment ? developmentConfig : productionConfig;

// Экспортируем отдельные конфигурации для прямого доступа
export { developmentConfig, ldapConfig, productionConfig };

// Утилитарная функция для получения базового URL
export const getApiBaseUrl = (): string => {
  const apiUrl = config.API_BASE_URL;
  return apiUrl;
};

// Утилитарная функция для получения базового URL для медиафайлов
export const getMediaBaseUrl = (): string => {
  // Убираем '/api' из конца URL, чтобы получить базовый адрес сервера
  return config.API_BASE_URL.replace(/\/api$/, '');
};

// Утилитарная функция для получения WebSocket URL
export const getWsBaseUrl = (): string => config.WS_BASE_URL || '';

// Утилитарная функция для проверки режима отладки
export const isDebugMode = (): boolean => config.DEBUG || false;

// Утилитарная функция для принудительного переключения в production
export const forceProductionMode = (): EnvironmentConfig => productionConfig;

// Утилитарная функция для принудительного переключения в development
export const forceDevelopmentMode = (): EnvironmentConfig => developmentConfig;

// Утилитарные функции для LDAP API
export const getLDAPBaseUrl = (): string => ldapConfig.LDAP_BASE_URL;
export const getLDAPEndpoint = (endpoint: keyof typeof ldapConfig.ENDPOINTS): string => 
  `${ldapConfig.LDAP_BASE_URL}${ldapConfig.ENDPOINTS[endpoint]}`;

// Полный URL для конкретного LDAP endpoint
export const buildLDAPUrl = (endpoint: keyof typeof ldapConfig.ENDPOINTS, params?: Record<string, string>): string => {
  let url = getLDAPEndpoint(endpoint);
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return url;
};
