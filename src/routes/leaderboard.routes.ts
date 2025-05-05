import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
const leaderboardController = new LeaderboardController();

router.get('/global', cacheMiddleware('5 minutes'), leaderboardController.getGlobalLeaderboard);
router.get('/league/:leagueId', cacheMiddleware('5 minutes'), leaderboardController.getLeagueLeaderboard);

router.get('/user/global-rank', authenticate, leaderboardController.getUserGlobalRank);
router.get('/user/league-rank/:leagueId', authenticate, leaderboardController.getUserLeagueRank);

export default router;