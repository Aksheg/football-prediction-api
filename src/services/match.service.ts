import { Op } from 'sequelize';
import { Match } from '../models';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';
import { MatchStatus } from '../models/Match';

export interface CreateMatchDto {
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  league: string;
  season: string;
}

export interface UpdateMatchDto {
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  endTime?: Date;
}

export class MatchService {

  async createMatch(matchData: CreateMatchDto): Promise<Match> {
    try {
      const match = await Match.create({
        ...matchData,
        status: MatchStatus.SCHEDULED,
      });

      await cacheService.deleteByPattern('cache:*/matches/upcoming*');

      return match;
    } catch (error) {
      logger.error('Error creating match:', error);
      throw error;
    }
  }


  async getMatchById(id: string): Promise<Match | null> {
    try {
      return await Match.findByPk(id);
    } catch (error) {
      logger.error(`Error fetching match ${id}:`, error);
      throw error;
    }
  }


  async getUpcomingMatches(limit: number = 10, offset: number = 0): Promise<{ matches: Match[], total: number }> {
    try {
      const now = new Date();
      
      const { rows, count } = await Match.findAndCountAll({
        where: {
          startTime: {
            [Op.gt]: now,
          },
          status: MatchStatus.SCHEDULED,
        },
        order: [['startTime', 'ASC']],
        limit,
        offset,
      });

      return {
        matches: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching upcoming matches:', error);
      throw error;
    }
  }


  async getLiveMatches(limit: number = 10, offset: number = 0): Promise<{ matches: Match[], total: number }> {
    try {
      const { rows, count } = await Match.findAndCountAll({
        where: {
          status: MatchStatus.LIVE,
        },
        order: [['startTime', 'ASC']],
        limit,
        offset,
      });

      return {
        matches: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching live matches:', error);
      throw error;
    }
  }

  async getCompletedMatches(limit: number = 10, offset: number = 0): Promise<{ matches: Match[], total: number }> {
    try {
      const { rows, count } = await Match.findAndCountAll({
        where: {
          status: MatchStatus.COMPLETED,
        },
        order: [['endTime', 'DESC']],
        limit,
        offset,
      });

      return {
        matches: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching completed matches:', error);
      throw error;
    }
  }


  async updateMatch(id: string, updateData: UpdateMatchDto): Promise<Match | null> {
    try {
      const match = await Match.findByPk(id);
      
      if (!match) {
        throw new Error('Match not found');
      }

      Object.assign(match, updateData);
      await match.save();

      await cacheService.deleteByPattern(`cache:*/matches/${id}*`);
      
      if (updateData.status) {
        if (updateData.status === MatchStatus.LIVE) {
          await cacheService.deleteByPattern('cache:*/matches/live*');
          await cacheService.deleteByPattern('cache:*/matches/upcoming*');
        } else if (updateData.status === MatchStatus.COMPLETED) {
          await cacheService.deleteByPattern('cache:*/matches/live*');
          await cacheService.deleteByPattern('cache:*/matches/completed*');
        }
      }

      return match;
    } catch (error) {
      logger.error(`Error updating match ${id}:`, error);
      throw error;
    }
  }


  async getMatchesByLeague(league: string, limit: number = 10, offset: number = 0): Promise<{ matches: Match[], total: number }> {
    try {
      const { rows, count } = await Match.findAndCountAll({
        where: {
          league,
        },
        order: [['startTime', 'DESC']],
        limit,
        offset,
      });

      return {
        matches: rows,
        total: count,
      };
    } catch (error) {
      logger.error(`Error fetching matches for league ${league}:`, error);
      throw error;
    }
  }


  async getMatchesBySeason(season: string, limit: number = 10, offset: number = 0): Promise<{ matches: Match[], total: number }> {
    try {
      const { rows, count } = await Match.findAndCountAll({
        where: {
          season,
        },
        order: [['startTime', 'DESC']],
        limit,
        offset,
      });

      return {
        matches: rows,
        total: count,
      };
    } catch (error) {
      logger.error(`Error fetching matches for season ${season}:`, error);
      throw error;
    }
  }
}
