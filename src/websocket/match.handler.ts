import { Server, Socket } from 'socket.io';
import { Match } from '../models';
import { logger } from '../utils/logger';
import { MatchService } from '../services/match.service';

export class MatchHandler {
  private io: Server;
  private matchService = new MatchService();

  constructor(io: Server) {
    this.io = io;
  }

  initialize(socket: Socket): void {
    socket.on('subscribe-match', (matchId: string) => {
      socket.join(`match:${matchId}`);
      logger.debug(`User ${socket.data.user?.username} subscribed to match ${matchId}`);
    });

    socket.on('unsubscribe-match', (matchId: string) => {
      socket.leave(`match:${matchId}`);
      logger.debug(`User ${socket.data.user?.username} unsubscribed from match ${matchId}`);
    });

    socket.on('get-match', async (matchId: string) => {
      try {
        const match = await this.matchService.getMatchById(matchId);
        if (!match) {
          throw new Error('Match not found');
        }
        socket.emit('match-data', match.toJSON());
      } catch (error) {
        logger.error('WebSocket get match error:', error);
        socket.emit('match-error', {
          message: error instanceof Error ? error.message : 'Failed to get match data',
        });
      }
    });

  }

  public notifyMatchUpdate(match: Match): void {
    this.io.to(`match:${match.id}`).emit('match-updated', match.toJSON());
  }

  public notifyMatchStart(match: Match): void {
    this.io.to(`match:${match.id}`).emit('match-started', match.toJSON());
    this.io.emit('live-match-added', match.toJSON());
  }

  public notifyMatchEnd(match: Match): void {
    this.io.to(`match:${match.id}`).emit('match-ended', match.toJSON());
    this.io.emit('live-match-removed', match.id);
  }
}