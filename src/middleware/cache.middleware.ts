import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

export interface CacheOptions {
  expiryInSeconds?: number;
  keyPrefix?: string;
}

export const cacheMiddleware = (options?: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const keyPrefix = options?.keyPrefix || 'cache';
    const expiryInSeconds = options?.expiryInSeconds || 300;

    const cacheKey = `${keyPrefix}:${req.originalUrl}`;

    try {
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }

      const originalSend = res.json;

      res.json = function (body): Response {
        cacheService.set(cacheKey, body, expiryInSeconds)
          .catch(err => logger.error(`Failed to cache response for ${cacheKey}:`, err));

        return originalSend.call(this, body);
      };

      return next();
    } catch (error) {
      logger.error(`Cache middleware error for ${cacheKey}:`, error);
      return next();
    }
  };
};