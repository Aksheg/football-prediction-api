import { Router } from 'express';
import authRoutes from './auth.routes';
import matchRoutes from './match.routes';
import predictionRoutes from './prediction.routes';
import leagueRoutes from './league.routes';
import rewardRoutes from './reward.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/matches', matchRoutes);
router.use('/predictions', predictionRoutes);
router.use('/leagues', leagueRoutes);
router.use('/rewards', rewardRoutes);
router.use('/leaderboards', leaderboardRoutes);

export default router;