
export interface EnvironmentConfig {
  API_BASE_URL: string;
  WS_BASE_URL?: string;
  DEBUG?: boolean;
}

const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'http://localhost:8000/api',
  WS_BASE_URL: 'ws://localhost:8000/ws',
  DEBUG: true,
};

const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://88aedcf33d45.ngrok-free.app/api',
  WS_BASE_URL: 'wss://88aedcf33d45.ngrok-free.app/ws',  
  DEBUG: false,
};

// Определяем, находимся ли мы в режиме разработки
// __DEV__ автоматически определяется React Native
const isDevelopment = __DEV__;

// Экспортируем конфигурацию в зависимости от окружения
export const config: EnvironmentConfig = isDevelopment ? developmentConfig : productionConfig;

// Экспортируем отдельные конфигурации для прямого доступа
export { developmentConfig, productionConfig };

// Утилитарная функция для получения базового URL
export const getApiBaseUrl = (): string => {
  const apiUrl = config.API_BASE_URL;
  console.log(`🔧 Using API URL: ${apiUrl} (${isDevelopment ? 'DEV' : 'PROD'} mode)`);
  return apiUrl;
};

// Утилитарная функция для получения WebSocket URL
export const getWsBaseUrl = (): string => config.WS_BASE_URL || '';

// Утилитарная функция для проверки режима отладки
export const isDebugMode = (): boolean => config.DEBUG || false;

// Утилитарная функция для принудительного переключения в production
export const forceProductionMode = (): EnvironmentConfig => productionConfig;

// Утилитарная функция для принудительного переключения в development
export const forceDevelopmentMode = (): EnvironmentConfig => developmentConfig;
