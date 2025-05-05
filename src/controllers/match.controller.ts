import { Request, Response } from 'express';
import { MatchService, CreateMatchDto, UpdateMatchDto } from '../services/match.service';
import { logger } from '../utils/logger';

export class MatchController {
  private matchService = new MatchService();


  createMatch = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchData: CreateMatchDto = req.body;
      const match = await this.matchService.createMatch(matchData);
      return res.status(201).json(match);
    } catch (error: any) {
      logger.error('Create match controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  getMatch = async (req: Request, res: Response) => {
    try {
      const matchId = req.params.id;
      const match = await this.matchService.getMatchById(matchId);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      return res.status(200).json(match);
    } catch (error: any) {
      logger.error('Get match controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getUpcomingMatches = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.matchService.getUpcomingMatches(limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get upcoming matches controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getLiveMatches = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.matchService.getLiveMatches(limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get live matches controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getCompletedMatches = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.matchService.getCompletedMatches(limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get completed matches controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  updateMatch = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const matchId = req.params.id;
      const updateData: UpdateMatchDto = req.body;
      
      const match = await this.matchService.updateMatch(matchId, updateData);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      return res.status(200).json(match);
    } catch (error: any) {
      logger.error('Update match controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  getMatchesByLeague = async (req: Request, res: Response) => {
    try {
      const league = req.params.league;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.matchService.getMatchesByLeague(league, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get matches by league controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getMatchesBySeason = async (req: Request, res: Response) => {
    try {
      const season = req.params.season;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.matchService.getMatchesBySeason(season, limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get matches by season controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}