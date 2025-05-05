import Redis from 'ioredis';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('error', (err) => {
  logger.error('Redis client error:', err);
});

export default redis;