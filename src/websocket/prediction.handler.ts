import { Server, Socket } from 'socket.io';
import { Match } from '../models';
import { logger } from '../utils/logger';
import { PredictionService } from '../services/prediction.service';

export class PredictionHandler {
  private io: Server;
  private predictionService = new PredictionService();

  constructor(io: Server) {
    this.io = io;
  }

  initialize(socket: Socket): void {
    socket.on('create-prediction', async (data: { matchId: string; homeScore: number; awayScore: number }) => {
      try {
        if (!socket.data.user) {
          throw new Error('Authentication required');
        }

        const userId = socket.data.user.id;
        const prediction = await this.predictionService.createPrediction(userId, {
          matchId: data.matchId,
          homeScore: data.homeScore,
          awayScore: data.awayScore,
        });

        const match = await Match.findByPk(data.matchId);
        if (!match) {
          throw new Error('Match not found');
        }

        this.io.to(`match:${data.matchId}`).emit('prediction-created', {
          userId,
          username: socket.data.user.username,
          matchId: data.matchId,
          homeScore: data.homeScore,
          awayScore: data.awayScore,
          timestamp: new Date(),
        });

        socket.emit('prediction-confirmed', {
          predictionId: prediction.id,
          matchId: data.matchId,
          homeScore: data.homeScore,
          awayScore: data.awayScore,
          status: 'PENDING',
        });

      } catch (error) {
        logger.error('WebSocket prediction error:', error);
        socket.emit('prediction-error', {
          message: error instanceof Error ? error.message : 'Failed to create prediction',
        });
      }
    });

    socket.on('get-predictions', async (matchId: string) => {
      try {
        const result = await this.predictionService.getMatchPredictions(matchId);
        socket.emit('predictions-list', {
          matchId,
          predictions: result.predictions,
        });
      } catch (error) {
        logger.error('WebSocket get predictions error:', error);
        socket.emit('predictions-error', {
          message: error instanceof Error ? error.message : 'Failed to get predictions',
        });
      }
    });
  }
}