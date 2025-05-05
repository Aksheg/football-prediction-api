import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Error middleware:', err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Authentication failed',
    });
  }

  res.status(500).json({
    message: 'Internal server error',
  });
}