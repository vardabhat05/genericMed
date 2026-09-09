import { config } from '../config/env';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = never expires
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private maxMemoryEntries: number = 2000;
  private isRedisConnected: boolean = false;
  private redisClient: any = null;

  constructor() {
    this.initRedis();
  }

  private async initRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      // In-memory fallback mode
      this.isRedisConnected = false;
      return;
    }

    try {
      // If redis package is available dynamically, we could connect;
      // otherwise, we seamlessly operate in resilient in-memory mode.
      this.isRedisConnected = false;
    } catch {
      this.isRedisConnected = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }

    // Check expiry
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    // Evict oldest if reaching capacity
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  public async flush(): Promise<void> {
    this.memoryCache.clear();
  }

  public isLive(): boolean {
    return this.isRedisConnected;
  }

  public size(): number {
    return this.memoryCache.size;
  }
}

export const cacheService = new CacheService();
