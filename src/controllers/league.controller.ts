import { Request, Response } from 'express';
import { LeagueService, CreateLeagueDto } from '../services/league.service';
import { logger } from '../utils/logger';

export class LeagueController {
  private leagueService = new LeagueService();

  createLeague = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagueData: CreateLeagueDto = req.body;
      const league = await this.leagueService.createLeague(req.user.id, leagueData);
      
      return res.status(201).json(league);
    } catch (error: any) {
      logger.error('Create league controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getLeague = async (req: Request, res: Response) => {
    try {
      const leagueId = req.params.id;
      const league = await this.leagueService.getLeagueById(leagueId);
      
      if (!league) {
        return res.status(404).json({ message: 'League not found' });
      }
      
      if (league.isPrivate && req.user) {
        const userLeagues = await this.leagueService.getUserLeagues(req.user.id);
        const isMember = userLeagues.some(l => l.id === leagueId);
        
        if (!isMember) {
          return res.status(403).json({ message: 'Access denied to private league' });
        }
      }
      
      return res.status(200).json(league);
    } catch (error: any) {
      logger.error('Get league controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getPublicLeagues = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await this.leagueService.getPublicLeagues(limit, offset);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Get public leagues controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  getUserLeagues = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagues = await this.leagueService.getUserLeagues(req.user.id);
      return res.status(200).json(leagues);
    } catch (error: any) {
      logger.error('Get user leagues controller error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  joinLeague = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagueId = req.params.id;
      const inviteCode = req.body.inviteCode;
      
      const success = await this.leagueService.joinLeague(req.user.id, leagueId, inviteCode);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to join league' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error('Join league controller error:', error);
      
      if (error.message === 'League not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'User is already a member') {
        return res.status(409).json({ message: error.message });
      }
      
      if (error.message === 'Invalid invite code') {
        return res.status(403).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  leaveLeague = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagueId = req.params.id;
      const success = await this.leagueService.leaveLeague(req.user.id, leagueId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to leave league' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error('Leave league controller error:', error);
      
      if (error.message === 'League not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'League owner cannot leave') {
        return res.status(403).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  deleteLeague = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagueId = req.params.id;
      const success = await this.leagueService.deleteLeague(req.user.id, leagueId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to delete league' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error('Delete league controller error:', error);
      
      if (error.message === 'League not found or user is not the owner') {
        return res.status(403).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  regenerateInviteCode = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const leagueId = req.params.id;
      const newCode = await this.leagueService.regenerateInviteCode(req.user.id, leagueId);
      
      return res.status(200).json({ inviteCode: newCode });
    } catch (error: any) {
      logger.error('Regenerate invite code controller error:', error);
      
      if (error.message === 'League not found or not private') {
        return res.status(403).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}