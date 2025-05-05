// src/services/league.service.ts
import { randomBytes } from 'crypto';
import { Transaction } from 'sequelize';
import { League, LeagueMember, User } from '../models';
import sequelize from '../config/database';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';

export interface CreateLeagueDto {
  name: string;
  isPrivate: boolean;
}

export class LeagueService {

  async createLeague(ownerId: string, leagueData: CreateLeagueDto): Promise<League> {
    const transaction = await sequelize.transaction();
    
    try {
      const inviteCode = leagueData.isPrivate 
        ? randomBytes(4).toString('hex').toUpperCase()
        : undefined;

      const league = await League.create({
        name: leagueData.name,
        ownerId,
        isPrivate: leagueData.isPrivate,
        inviteCode,
      }, { transaction });

      await LeagueMember.create({
        leagueId: league.id,
        userId: ownerId,
      }, { transaction });

      await transaction.commit();

      await cacheService.deleteByPattern('cache:*/leagues*');

      return league;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating league:', error);
      throw error;
    }
  }


  async getLeagueById(id: string): Promise<League | null> {
    try {
      return await League.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username'],
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'username', 'points'],
            through: { attributes: [] },
          },
        ],
      });
    } catch (error) {
      logger.error(`Error fetching league ${id}:`, error);
      throw error;
    }
  }


  async getPublicLeagues(limit: number = 10, offset: number = 0): Promise<{ leagues: League[], total: number }> {
    try {
      const { rows, count } = await League.findAndCountAll({
        where: {
          isPrivate: false,
        },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        leagues: rows,
        total: count,
      };
    } catch (error) {
      logger.error('Error fetching public leagues:', error);
      throw error;
    }
  }

  async getUserLeagues(userId: string): Promise<League[]> {
    try {
      const leagueMembers = await LeagueMember.findAll({
        where: {
          userId,
        },
        include: [
          {
            model: League,
            as: 'league',
            include: [
              {
                model: User,
                as: 'owner',
                attributes: ['id', 'username'],
              },
            ],
          },
        ],
      });

      return leagueMembers.map(member => member.league);
    } catch (error) {
      logger.error(`Error fetching leagues for user ${userId}:`, error);
      throw error;
    }
  }


  async joinLeague(userId: string, leagueId: string, inviteCode?: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const league = await League.findByPk(leagueId, { transaction });
      
      if (!league) {
        throw new Error('League not found');
      }

      const existingMembership = await LeagueMember.findOne({
        where: {
          leagueId,
          userId,
        },
        transaction,
      });

      if (existingMembership) {
        throw new Error('User is already a member of this league');
      }

      if (league.isPrivate) {
        if (!inviteCode || inviteCode !== league.inviteCode) {
          throw new Error('Invalid invite code');
        }
      }

      await LeagueMember.create({
        leagueId,
        userId,
      }, { transaction });

      await transaction.commit();

      await cacheService.deleteByPattern(`cache:*/leagues/${leagueId}*`);
      await cacheService.deleteByPattern(`cache:*/leagues/user/${userId}*`);
      await cacheService.deleteByPattern('cache:*/leaderboard*');

      return true;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error joining league ${leagueId}:`, error);
      throw error;
    }
  }

      

  async leaveLeague(userId: string, leagueId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const league = await League.findByPk(leagueId, { transaction });
      
      if (!league) {
        throw new Error('League not found');
      }

      if (league.ownerId === userId) {
        throw new Error('League owner cannot leave the league');
      }

      const result = await LeagueMember.destroy({
        where: {
          leagueId,
          userId,
        },
        transaction,
      });

      if (result === 0) {
        throw new Error('User is not a member of this league');
      }

      await transaction.commit();

      await cacheService.deleteByPattern(`cache:*/leagues/${leagueId}*`);
      await cacheService.deleteByPattern(`cache:*/leagues/user/${userId}*`);
      await cacheService.deleteByPattern('cache:*/leaderboard*');

      return true;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error leaving league ${leagueId}:`, error);
      throw error;
    }
  }


  async deleteLeague(userId: string, leagueId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      const league = await League.findOne({
        where: {
          id: leagueId,
          ownerId: userId,
        },
        transaction,
      });
      
      if (!league) {
        throw new Error('League not found or user is not the owner');
      }

      await LeagueMember.destroy({
        where: {
          leagueId,
        },
        transaction,
      });

      await league.destroy({ transaction });

      await transaction.commit();

      await cacheService.deleteByPattern('cache:*/leagues*');
      await cacheService.deleteByPattern('cache:*/leaderboard*');

      return true;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error deleting league ${leagueId}:`, error);
      throw error;
    }
  }


  async regenerateInviteCode(userId: string, leagueId: string): Promise<string> {
    const transaction = await sequelize.transaction();
    
    try {
      const league = await League.findOne({
        where: {
          id: leagueId,
          ownerId: userId,
          isPrivate: true,
        },
        transaction,
      });

      if (!league) {
        throw new Error('League not found or not private');
      }

      const newInviteCode = randomBytes(4).toString('hex').toUpperCase();
      league.inviteCode = newInviteCode;
      await league.save({ transaction });

      await transaction.commit();

      await cacheService.deleteByPattern(`cache:*/leagues/${leagueId}*`);

      return newInviteCode;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error regenerating invite code for league ${leagueId}:`, error);
      throw error;
    }
  }
}