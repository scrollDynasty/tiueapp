export interface EnvironmentConfig {
  API_BASE_URL: string;
  WS_BASE_URL?: string;
  DEBUG?: boolean;
}

const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://mobile.tiue.uz/api',
  WS_BASE_URL: 'wss://mobile.tiue.uz/ws',
  DEBUG: true,
};

const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://mobile.tiue.uz/api',
  WS_BASE_URL: 'wss://mobile.tiue.uz/ws',
  DEBUG: false,
};

const ldapConfig = {

  LDAP_BASE_URL: 'https://my.tiue.uz',

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

const forceProduction = false;
const isDevelopment = forceProduction ? false : (__DEV__ ?? true);

export const config: EnvironmentConfig = isDevelopment ? developmentConfig : productionConfig;

export { developmentConfig, ldapConfig, productionConfig };

export const getApiBaseUrl = (): string => {
  const apiUrl = config.API_BASE_URL;
  return apiUrl;
};

export const getMediaBaseUrl = (): string => {

  return config.API_BASE_URL.replace(/\/api$/, '');
};

export const getWsBaseUrl = (): string => config.WS_BASE_URL || '';

export const isDebugMode = (): boolean => config.DEBUG || false;

export const forceProductionMode = (): EnvironmentConfig => productionConfig;

export const forceDevelopmentMode = (): EnvironmentConfig => developmentConfig;

export const getLDAPBaseUrl = (): string => ldapConfig.LDAP_BASE_URL;
export const getLDAPEndpoint = (endpoint: keyof typeof ldapConfig.ENDPOINTS): string =>
  `${ldapConfig.LDAP_BASE_URL}${ldapConfig.ENDPOINTS[endpoint]}`;

export const buildLDAPUrl = (endpoint: keyof typeof ldapConfig.ENDPOINTS, params?: Record<string, string>): string => {
  let url = getLDAPEndpoint(endpoint);
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return url;
};
