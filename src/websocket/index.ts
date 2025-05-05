import { Server } from 'socket.io';
import { Match, Prediction } from '../models';
import { logger } from '../utils/logger';

export default class WebSocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }


  notifyMatchUpdate(match: Match): void {
    logger.debug(`Broadcasting match update for ${match.id}`);
    
    this.io.to(`match:${match.id}`).emit('match-update', {
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      startTime: match.startTime,
      endTime: match.endTime,
    });
  }


  notifyPredictionMade(prediction: Prediction, username: string): void {
    logger.debug(`Broadcasting prediction for match ${prediction.matchId}`);
    
    this.io.to(`match:${prediction.matchId}`).emit('new-prediction', {
      matchId: prediction.matchId,
      username: username,
      timestamp: prediction.createdAt,
    });

    this.io.to(`user:${prediction.userId}`).emit('prediction-confirmed', {
      id: prediction.id,
      matchId: prediction.matchId,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      status: prediction.status,
      timestamp: prediction.createdAt,
    });
  }


  notifyPointsAwarded(prediction: Prediction, points: number, userId: string): void {
    logger.debug(`Broadcasting points awarded to user ${userId}`);
    
    this.io.to(`user:${userId}`).emit('points-awarded', {
      predictionId: prediction.id,
      matchId: prediction.matchId,
      points: points,
    });
  }


  notifyLeaderboardUpdate(leagueId: string | null): void {
    logger.debug(`Broadcasting leaderboard update ${leagueId ? `for league ${leagueId}` : 'global'}`);
    
    if (leagueId) {
      this.io.to(`league:${leagueId}`).emit('leaderboard-update', {
        leagueId: leagueId,
        timestamp: new Date(),
      });
    } else {
      this.io.emit('global-leaderboard-update', {
        timestamp: new Date(),
      });
    }
  }
}