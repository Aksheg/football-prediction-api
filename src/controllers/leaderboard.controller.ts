import { Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import { logger } from '../utils/logger';

export class LeaderboardController {
  private leaderboardService = new LeaderboardService();


  getGlobalLeaderboard = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.leaderboardService.getGlobalLeaderboard(limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get global leaderboard controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getLeagueLeaderboard = async (req: Request, res: Response) => {
    try {
      const leagueId = req.params.leagueId;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.leaderboardService.getLeagueLeaderboard(leagueId, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get league leaderboard controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getUserGlobalRank = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const result = await this.leaderboardService.getUserGlobalRank(req.user.id);
      
      if (!result) {
        return res.status(404).json({ message: 'Rank not found' });
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get user global rank controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getUserLeagueRank = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagueId = req.params.leagueId;
      const result = await this.leaderboardService.getUserLeagueRank(req.user.id, leagueId);
      
      if (!result) {
        return res.status(404).json({ message: 'Rank not found' });
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get user league rank controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}