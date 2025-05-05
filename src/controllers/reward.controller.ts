import { Request, Response } from 'express';
import { RewardService } from '../services/reward.service';
import { logger } from '../utils/logger';

export class RewardController {
  private rewardService = new RewardService();


  getUserRewards = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.rewardService.getUserRewards(req.user.id, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get user rewards controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getRecentRewards = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.rewardService.getRecentRewards(limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get recent rewards controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getMatchRewards = async (req: Request, res: Response) => {
    try {
      const matchId = req.params.matchId;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.rewardService.getMatchRewards(matchId, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get match rewards controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}