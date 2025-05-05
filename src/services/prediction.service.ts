import { Transaction } from 'sequelize';
import { Match, PredictionStatus, User, Reward, Prediction } from '../models';
import sequelize from '../config/database';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';
import { MatchStatus } from '../models/Match';

export interface CreatePredictionDto {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export class PredictionService {

  async createPrediction(userId: string, predictionData: CreatePredictionDto): Promise<Prediction> {
    const transaction = await sequelize.transaction();
    
    try {
      const match = await Match.findByPk(predictionData.matchId);
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      if (match.status !== MatchStatus.SCHEDULED) {
        throw new Error('Match has already started or ended');
      }
      
      if (new Date() >= match.startTime) {
        throw new Error('Too late to make a prediction');
      }

      const existingPrediction = await Prediction.findOne({
        where: {
          userId,
          matchId: predictionData.matchId,
        },
        transaction,
      });

      let prediction: Prediction;
      
      if (existingPrediction) {
        existingPrediction.homeScore = predictionData.homeScore;
        existingPrediction.awayScore = predictionData.awayScore;
        prediction = await existingPrediction.save({ transaction });
      } else {
        prediction = await Prediction.create({
          userId,
          matchId: predictionData.matchId,
          homeScore: predictionData.homeScore,
          awayScore: predictionData.awayScore,
          status: PredictionStatus.PENDING,
        }, { transaction });
      }

      await transaction.commit();
      return prediction;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating prediction:', error);
      throw error;
    }
  }


  async getUserPredictions(userId: string, limit: number = 10, offset: number = 0): Promise<{ predictions: Prediction[], total: number }> {
    try {
      const { rows, count } = await Prediction.findAndCountAll({
        where: {
          userId,
        },
        include: [
          {
            model: Match,
            as: 'match',
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        predictions: rows,
        total: count,
      };
    } catch (error) {
      logger.error(`Error fetching predictions for user ${userId}:`, error);
      throw error;
    }
  }


  async getMatchPredictions(matchId: string, limit: number = 10, offset: number = 0): Promise<{ predictions: Prediction[], total: number }> {
    try {
      const { rows, count } = await Prediction.findAndCountAll({
        where: {
          matchId,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        order: [['createdAt', 'ASC']],
        limit,
        offset,
      });

      return {
        predictions: rows,
        total: count,
      };
    } catch (error) {
      logger.error(`Error fetching predictions for match ${matchId}:`, error);
      throw error;
    }
  }


  async calculatePoints(matchId: string): Promise<void> {
    const transaction = await sequelize.transaction();
    
    try {
      const match = await Match.findByPk(matchId);
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      if (match.status !== MatchStatus.COMPLETED) {
        throw new Error('Match is not completed yet');
      }
      
      if (match.homeScore === undefined || match.awayScore === undefined) {
        throw new Error('Match result not available');
      }

      const predictions = await Prediction.findAll({
        where: {
          matchId,
          status: PredictionStatus.PENDING,
        },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
        transaction,
      });

      for (const prediction of predictions) {
        const user = prediction.user;
        let points = 0;
        let description = '';

        if (prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore) {
          points = 3;
          description = 'Exact score prediction';
        } 
        else if (
          (prediction.homeScore > prediction.awayScore && match.homeScore > match.awayScore && 
           (prediction.homeScore - prediction.awayScore) === (match.homeScore - match.awayScore)) ||
          (prediction.homeScore < prediction.awayScore && match.homeScore < match.awayScore &&
           (prediction.awayScore - prediction.homeScore) === (match.awayScore - match.homeScore)) ||
          (prediction.homeScore === prediction.awayScore && match.homeScore === match.awayScore)
        ) {
          points = 2;
          description = 'Correct outcome with goal difference';
        }
        else if (
          (prediction.homeScore > prediction.awayScore && match.homeScore > match.awayScore) ||
          (prediction.homeScore < prediction.awayScore && match.homeScore < match.awayScore) ||
          (prediction.homeScore === prediction.awayScore && match.homeScore === match.awayScore)
        ) {
          points = 1;
          description = 'Correct outcome';
        }

        prediction.points = points;
        prediction.status = PredictionStatus.CALCULATED;
        await prediction.save({ transaction });

        if (points > 0) {
          await Reward.create({
            userId: user.id,
            predictionId: prediction.id,
            points,
            description,
          }, { transaction });

          user.points += points;
          await user.save({ transaction });
        }
      }

      await transaction.commit();
      
      await cacheService.deleteByPattern(`cache:*/predictions/match/${matchId}*`);
      await cacheService.deleteByPattern('cache:*/predictions/user/*');
      await cacheService.deleteByPattern('cache:*/leaderboard*');
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error calculating points for match ${matchId}:`, error);
      throw error;
    }
  }
}