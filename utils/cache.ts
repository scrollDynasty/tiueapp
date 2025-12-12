import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  ttl?: number;
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

  async set<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.memoryCache.set(key, cacheItem);

    try {
      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {

    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data as T;
    }

    try {
      const storedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const cacheItem: CacheItem<T> = JSON.parse(storedItem);
        if (this.isValid(cacheItem)) {

          this.memoryCache.set(key, cacheItem);
          return cacheItem.data;
        } else {

          await this.remove(key);
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }

    return null;
  }

  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

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

  async preload<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {

      fetcher().then(data => this.set(key, data, ttl)).catch(() => {});
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

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

export const cacheKeys = {
  news: 'news_list',
  events: 'events_list',
  grades: (userId: string) => `grades_${userId}`,
  courses: (userId: string) => `courses_${userId}`,
  userProfile: (userId: string) => `user_${userId}`,
} as const;

export const cacheTTL = {
  short: 5 * 60 * 1000,
  medium: 30 * 60 * 1000,
  long: 2 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
} as const;

export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = cacheTTL.medium
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    const cached = await cache.get(key);
    if (cached) {
      return cached;
    }

    const result = await fn(...args);

    await cache.set(key, result, ttl);

    return result;
  }) as T;
}
