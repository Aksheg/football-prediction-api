import http from 'http';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyToken, JwtPayload } from '../utils/jwt';

export default function configureWebSocket(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      
      socket.data.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
      };
      
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as JwtPayload;
    logger.info(`User connected: ${user.username} (${socket.id})`);

    socket.join(`user:${user.userId}`);

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.username} (${socket.id})`);
    });

    socket.on('join-match', (matchId: string) => {
      socket.join(`match:${matchId}`);
      logger.debug(`${user.username} joined match room: ${matchId}`);
    });

    socket.on('leave-match', (matchId: string) => {
      socket.leave(`match:${matchId}`);
      logger.debug(`${user.username} left match room: ${matchId}`);
    });

    socket.on('join-league', (leagueId: string) => {
      socket.join(`league:${leagueId}`);
      logger.debug(`${user.username} joined league room: ${leagueId}`);
    });

    socket.on('leave-league', (leagueId: string) => {
      socket.leave(`league:${leagueId}`);
      logger.debug(`${user.username} left league room: ${leagueId}`);
    });
  });

  return io;
}