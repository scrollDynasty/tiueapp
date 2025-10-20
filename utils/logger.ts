/**
 * Утилита для логирования, которая работает только в development режиме
 * Помогает избежать console.log в продакшене
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  log: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

class DevLogger implements Logger {
  private createLogMethod = (level: LogLevel) => {
    return (message: string, ...args: any[]) => {
      // В продакшене можно отправлять критические ошибки в систему мониторинга
      // if (!__DEV__ && level === 'error') {
      //   // Отправить в Crashlytics, Sentry и т.д.
      // }
    };
  };

  log = this.createLogMethod('log');
  info = this.createLogMethod('info');
  warn = this.createLogMethod('warn');
  error = this.createLogMethod('error');
  debug = this.createLogMethod('debug');
}

// Экспортируем единственный экземпляр
export const logger = new DevLogger();

// Вспомогательные функции для часто используемых паттернов
export const apiLogger = {
  request: (url: string, method: string, data?: any) => {
    logger.debug(`🌐 API Request: ${method} ${url}`, data);
  },
  response: (url: string, status: number, data?: any) => {
    logger.debug(`📡 API Response: ${status} ${url}`, data);
  },
  error: (url: string, error: any) => {
    logger.error(`❌ API Error: ${url}`, error);
  },
};

export const authLogger = {
  login: (success: boolean, user?: any) => {
    logger.info(success ? '✅ Login successful' : '❌ Login failed', user);
  },
  logout: () => {
    logger.info('🚪 User logged out');
  },
  tokenRefresh: (success: boolean) => {
    logger.debug(success ? '🔄 Token refreshed' : '❌ Token refresh failed');
  },
};

export const navigationLogger = {
  navigate: (screen: string, params?: any) => {
    logger.debug(`🧭 Navigate to: ${screen}`, params);
  },
  goBack: () => {
    logger.debug('⬅️ Navigate back');
  },
};

// Утилита для измерения производительности
export const performanceLogger = {
  start: (label: string) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.time(label);
    }
  },
  end: (label: string) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.timeEnd(label);
    }
  },
  mark: (label: string, message?: string) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const timestamp = performance.now();
      logger.debug(`⏱️ ${label}: ${timestamp.toFixed(2)}ms${message ? ` - ${message}` : ''}`);
    }
  },
};

export default logger;