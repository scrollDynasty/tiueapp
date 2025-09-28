import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheItem<any>> = new Map();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Сохранение в кэш (память + AsyncStorage)
  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Сохраняем в памяти
    this.memoryCache.set(key, cacheItem);

    // Сохраняем в AsyncStorage для персистентности
    try {
      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  // Получение из кэша
  async get<T>(key: string): Promise<T | null> {
    // Сначала проверяем память
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data as T;
    }

    // Затем проверяем AsyncStorage
    try {
      const storedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const cacheItem: CacheItem<T> = JSON.parse(storedItem);
        if (this.isValid(cacheItem)) {
          // Восстанавливаем в память
          this.memoryCache.set(key, cacheItem);
          return cacheItem.data;
        } else {
          // Удаляем устаревшие данные
          await this.remove(key);
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }

    return null;
  }

  // Проверка валидности кэша
  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  // Удаление из кэша
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  // Очистка всего кэша
  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Предварительная загрузка данных
  async preload<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      // Возвращаем кэшированные данные и обновляем в фоне
      fetcher().then(data => this.set(key, data, ttl)).catch(() => {});
      return cached;
    }

    // Если кэша нет, загружаем и сохраняем
    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  // Пакетная предзагрузка
  async preloadBatch(
    requests: Array<{
      key: string;
      fetcher: () => Promise<any>;
      ttl?: number;
    }>
  ): Promise<void> {
    await Promise.all(
      requests.map(({ key, fetcher, ttl }) =>
        this.preload(key, fetcher, ttl).catch(() => {})
      )
    );
  }
}

export const cache = CacheManager.getInstance();

// Хелперы для типизированного кэширования
export const cacheKeys = {
  news: 'news_list',
  events: 'events_list',
  grades: (userId: string) => `grades_${userId}`,
  courses: (userId: string) => `courses_${userId}`,
  userProfile: (userId: string) => `user_${userId}`,
} as const;

// TTL константы (в миллисекундах)
export const cacheTTL = {
  short: 5 * 60 * 1000, // 5 минут
  medium: 30 * 60 * 1000, // 30 минут
  long: 2 * 60 * 60 * 1000, // 2 часа
  day: 24 * 60 * 60 * 1000, // 1 день
} as const;

// Декоратор для кэширования API вызовов
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = cacheTTL.medium
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Пытаемся получить из кэша
    const cached = await cache.get(key);
    if (cached) {
      return cached;
    }

    // Если кэша нет, вызываем функцию
    const result = await fn(...args);
    
    // Сохраняем результат в кэш
    await cache.set(key, result, ttl);
    
    return result;
  }) as T;
}