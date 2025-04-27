
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  capacity: number; // Maximum number of items in cache
}

export class Cache<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private ttl: number;
  private capacity: number;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.ttl = config.ttl;
    this.capacity = config.capacity;
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
