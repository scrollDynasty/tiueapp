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

    };
  };

  log = this.createLogMethod('log');
  info = this.createLogMethod('info');
  warn = this.createLogMethod('warn');
  error = this.createLogMethod('error');
  debug = this.createLogMethod('debug');
}

export const logger = new DevLogger();

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

export const performanceLogger = {
  start: (label: string) => {
    if (__DEV__) {
      console.time(label);
    }
  },
  end: (label: string) => {
    if (__DEV__) {
      console.timeEnd(label);
    }
  },
  mark: (label: string, message?: string) => {
    if (__DEV__) {
      const timestamp = performance.now();
      logger.debug(`⏱️ ${label}: ${timestamp.toFixed(2)}ms${message ? ` - ${message}` : ''}`);
    }
  },
};

export default logger;
