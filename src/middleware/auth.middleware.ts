import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};