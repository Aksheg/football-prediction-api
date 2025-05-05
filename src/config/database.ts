import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

dotenv.config();

const dbName = process.env.DB_NAME || 'football_prediction';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);

const sequelize = new Sequelize({
  database: dbName,
  username: dbUser,
  password: dbPassword,
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  models: [path.join(__dirname, '../models')],
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;