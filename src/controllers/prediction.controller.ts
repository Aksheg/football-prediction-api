import { Request, Response } from 'express';
import { PredictionService, CreatePredictionDto } from '../services/prediction.service';
import { logger } from '../utils/logger';

export class PredictionController {
  private predictionService = new PredictionService();

  createPrediction = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const predictionData: CreatePredictionDto = req.body;
      const prediction = await this.predictionService.createPrediction(req.user.id, predictionData);
      
      return res.status(201).json(prediction);
    } catch (error: any) {
      logger.error('Create prediction controller error:', error);
      
      if (error.message === 'Match not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('already started') || error.message.includes('Too late')) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getUserPredictions = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.predictionService.getUserPredictions(req.user.id, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get user predictions controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getMatchPredictions = async (req: Request, res: Response) => {
    try {
      const matchId = req.params.matchId;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.predictionService.getMatchPredictions(matchId, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get match predictions controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}