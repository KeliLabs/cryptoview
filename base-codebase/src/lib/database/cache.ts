import { createClient } from 'redis';

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const redis = globalForRedis.redis ?? createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Connect to Redis
if (!redis.isReady) {
  redis.connect().catch(console.error);
}

export class CacheService {
  private static readonly DEFAULT_TTL = 300; // 5 minutes in seconds

  // Generic cache get
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Generic cache set
  static async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Cache delete
  static async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Cache multiple keys
  static async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Blockchain-specific cache keys
  static blockchainStatsKey(blockchain: string): string {
    return `blockchain:stats:${blockchain}`;
  }

  static cryptocurrencyKey(symbol: string): string {
    return `cryptocurrency:${symbol}`;
  }

  static historicalDataKey(cryptoId: string, timeRange: string): string {
    return `historical:${cryptoId}:${timeRange}`;
  }

  static aiPredictionKey(cryptoId: string): string {
    return `ai:prediction:${cryptoId}`;
  }

  static newsSentimentKey(cryptoId: string): string {
    return `news:sentiment:${cryptoId}`;
  }

  // Cache with automatic key generation
  static async cacheBlockchainStats<T>(blockchain: string, data: T, ttl: number = 300): Promise<void> {
    await this.set(this.blockchainStatsKey(blockchain), data, ttl);
  }

  static async getCachedBlockchainStats<T>(blockchain: string): Promise<T | null> {
    return this.get<T>(this.blockchainStatsKey(blockchain));
  }

  static async cacheCryptocurrency<T>(symbol: string, data: T, ttl: number = 600): Promise<void> {
    await this.set(this.cryptocurrencyKey(symbol), data, ttl);
  }

  static async getCachedCryptocurrency<T>(symbol: string): Promise<T | null> {
    return this.get<T>(this.cryptocurrencyKey(symbol));
  }
}

export default redis;
