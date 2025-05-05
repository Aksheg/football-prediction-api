// src/services/leaderboard.service.ts
import { Leaderboard, User, League } from '../models';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

export class LeaderboardService {

  async updateLeaderboards(): Promise<void> {
    const transaction = await sequelize.transaction();
    
    try {
      await this.updateGlobalLeaderboard(transaction);
      
      await this.updateLeagueLeaderboards(transaction);
      
      await transaction.commit();
      
      await cacheService.deleteByPattern('cache:*/leaderboard*');
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating leaderboards:', error);
      throw error;
    }
  }

  async getGlobalLeaderboard(limit: number = 10, offset: number = 0): Promise<{ leaderboard: Leaderboard[], total: number }> {
    try {
      const cacheKey = `leaderboard:global:${limit}:${offset}`;
      const cachedData = await cacheService.get<{ leaderboard: Leaderboard[], total: number }>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const { rows, count } = await Leaderboard.findAndCountAll({
        where: {
          leagueId: null,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        order: [['rank', 'ASC']],
        limit,
        offset,
      });

      const result = {
        leaderboard: rows,
        total: count,
      };

      await cacheService.set(cacheKey, result, 3600); 

      return result;
    } catch (error) {
      logger.error('Error fetching global leaderboard:', error);
      throw error;
    }
  }

  async getLeagueLeaderboard(leagueId: string, limit: number = 10, offset: number = 0): Promise<{ leaderboard: Leaderboard[], total: number }> {
    try {
      const cacheKey = `leaderboard:league:${leagueId}:${limit}:${offset}`;
      const cachedData = await cacheService.get<{ leaderboard: Leaderboard[], total: number }>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const { rows, count } = await Leaderboard.findAndCountAll({
        where: {
          leagueId,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        order: [['rank', 'ASC']],
        limit,
        offset,
      });

      const result = {
        leaderboard: rows,
        total: count,
      };

      await cacheService.set(cacheKey, result, 3600);

      return result;
    } catch (error) {
      logger.error(`Error fetching leaderboard for league ${leagueId}:`, error);
      throw error;
    }
  }


  async getUserGlobalRank(userId: string): Promise<{ rank: number, points: number } | null> {
    try {
      const cacheKey = `leaderboard:user:${userId}:global`;
      const cachedData = await cacheService.get<{ rank: number, points: number }>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const leaderboardEntry = await Leaderboard.findOne({
        where: {
          userId,
          leagueId: null,
        },
        attributes: ['rank', 'points'],
      });

      if (!leaderboardEntry) {
        return null;
      }

      const result = {
        rank: leaderboardEntry.rank,
        points: leaderboardEntry.points,
      };

      await cacheService.set(cacheKey, result, 1800);

      return result;
    } catch (error) {
      logger.error(`Error fetching global rank for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserLeagueRank(userId: string, leagueId: string): Promise<{ rank: number, points: number } | null> {
    try {
      const cacheKey = `leaderboard:user:${userId}:league:${leagueId}`;
      const cachedData = await cacheService.get<{ rank: number, points: number }>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const leaderboardEntry = await Leaderboard.findOne({
        where: {
          userId,
          leagueId,
        },
        attributes: ['rank', 'points'],
      });

      if (!leaderboardEntry) {
        return null;
      }

      const result = {
        rank: leaderboardEntry.rank,
        points: leaderboardEntry.points,
      };

      await cacheService.set(cacheKey, result, 1800);

      return result;
    } catch (error) {
      logger.error(`Error fetching league rank for user ${userId}:`, error);
      throw error;
    }
  }

  private async updateGlobalLeaderboard(transaction: any): Promise<void> {
    await sequelize.query(`
      INSERT INTO leaderboards (id, "userId", "leagueId", points, rank, "createdAt", "updatedAt")
      SELECT 
        gen_random_uuid(),
        u.id,
        NULL,
        u.points,
        RANK() OVER (ORDER BY u.points DESC),
        NOW(),
        NOW()
      FROM users u
      ON CONFLICT ("userId", "leagueId") 
      DO UPDATE SET
        points = EXCLUDED.points,
        rank = EXCLUDED.rank,
        "updatedAt" = NOW()
    `, { transaction });
  }

  private async updateLeagueLeaderboards(transaction: any): Promise<void> {
    await sequelize.query(`
      INSERT INTO leaderboards (id, "userId", "leagueId", points, rank, "createdAt", "updatedAt")
      SELECT 
        gen_random_uuid(),
        u.id,
        lm."leagueId",
        u.points,
        RANK() OVER (PARTITION BY lm."leagueId" ORDER BY u.points DESC),
        NOW(),
        NOW()
      FROM users u
      JOIN league_members lm ON u.id = lm."userId"
      ON CONFLICT ("userId", "leagueId") 
      DO UPDATE SET
        points = EXCLUDED.points,
        rank = EXCLUDED.rank,
        "updatedAt" = NOW()
    `, { transaction });
  }
}