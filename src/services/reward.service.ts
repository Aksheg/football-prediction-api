import { Reward, User, Prediction, Match } from '../models';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';

export class RewardService {

  async getUserRewards(userId: string, limit: number = 10, offset: number = 0): Promise<{ rewards: Reward[], total: number }> {
    try {
      const { rows, count } = await Reward.findAndCountAll({
        where: {
          userId,
        },
        include: [
          {
            model: Prediction,
            as: 'prediction',
            include: [
              {
                model: Match,
                as: 'match',
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        rewards: rows,
        total: count,
      };
    } catch (error) {
      logger.error(`Error fetching rewards for user ${userId}:`, error);
      throw error;
    }
  }


  async getRecentRewards(limit: number = 10, offset: number = 0): Promise<{ rewards: Reward[], total: number }> {
    try {
      const { rows, count } = await Reward.findAndCountAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
          {
            model: Prediction,
            as: 'prediction',
            include: [
              {
                model: Match,
                as: 'match',
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        rewards: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching recent rewards:', error);
      throw error;
    }
  }

  async getMatchRewards(matchId: string, limit: number = 10, offset: number = 0): Promise<{ rewards: Reward[], total: number }> {
    try {
      const { rows, count } = await Reward.findAndCountAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
          {
            model: Prediction,
            as: 'prediction',
            where: {
              matchId,
            },
            include: [
              {
                model: Match,
                as: 'match',
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        rewards: rows,
        total: count,
      };
    } catch (error) {
      logger.error(`Error fetching rewards for match ${matchId}:`, error);
      throw error;
    }
  }
}