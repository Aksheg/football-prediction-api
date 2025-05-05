import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initDatabase } from './config/database';
import configureWebSocket from './config/websocket';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';
import redis from './config/redis';
import WebSocketService from './websocket';

class App {
  public app: express.Application;
  public server: http.Server;
  public io: ReturnType<typeof configureWebSocket>;
  private webSocketService: WebSocketService;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = configureWebSocket(this.server);
    this.webSocketService = new WebSocketService(this.io);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeDatabase();
    this.initializeRedis();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await initDatabase();
      logger.info('Database initialized');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    }
  }

  private initializeRedis(): void {
    redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public listen(port: number): void {
    this.server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  }
}

export default App;