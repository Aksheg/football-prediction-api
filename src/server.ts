import dotenv from 'dotenv';
import App from './app';
import { logger } from './utils/logger';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const app = new App();
app.listen(PORT);

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});