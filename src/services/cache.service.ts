import redis from '../config/redis';
import { logger } from '../utils/logger';

export class CacheService {

  async set(key: string, value: any, expiryInSeconds?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (expiryInSeconds) {
        await redis.set(key, stringValue, 'EX', expiryInSeconds);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
      throw error;
    }
  }


  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      
      if (!value) {
        return null;
      }
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      throw error;
    }
  }


  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}:`, error);
      throw error;
    }
  }


  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error(`Error deleting cache by pattern ${pattern}:`, error);
      throw error;
    }
  }


  async exists(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Error checking if key ${key} exists:`, error);
      throw error;
    }
  }
}

export const cacheService = new CacheService();