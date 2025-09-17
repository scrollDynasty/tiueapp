
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
  API_BASE_URL: 'https://6d9c49f1ba60.ngrok-free.app/api',
  WS_BASE_URL: 'wss://6d9c49f1ba60.ngrok-free.app/ws',
  DEBUG: false,
};

// 📝 Инструкция для переключения на ngrok:
// 1. Установите forceProduction = true выше
// 2. Обновите URL в productionConfig на ваш текущий ngrok URL
// 3. Убедитесь, что Django запущен: python manage.py runserver 0.0.0.0:8000
// 4. Убедитесь, что ngrok запущен: ngrok http 8000

// Определяем, находимся ли мы в режиме разработки
// __DEV__ автоматически определяется React Native
// Добавляем флаг для принудительного использования продакшн режима
const forceProduction = true; // Установите true для принудительного использования ngrok
const isDevelopment = forceProduction ? false : (__DEV__ ?? true);

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
