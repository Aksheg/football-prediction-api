// src/utils/logger.ts
import { createLogger, transports, format } from 'winston';

export const logger = createLogger({
  level: 'info', // Default level
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${stack ? `\n${stack}` : ''}`;
    })
  ),
  transports: [
    new transports.Console(), // Log to console
    // Optional: file transport or third-party integrations
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' }),
  ],
});
