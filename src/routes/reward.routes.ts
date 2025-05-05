import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
const rewardController = new RewardController();

router.get('/recent', cacheMiddleware('5 minutes'), rewardController.getRecentRewards);
router.get('/match/:matchId', cacheMiddleware('1 hour'), rewardController.getMatchRewards);

router.get('/user/myrewards', authenticate, rewardController.getUserRewards);

export default router;