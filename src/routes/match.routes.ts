import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
const matchController = new MatchController();

router.get('/', cacheMiddleware('5 minutes'), matchController.getUpcomingMatches);
router.get('/upcoming', cacheMiddleware('5 minutes'), matchController.getUpcomingMatches);
router.get('/live', cacheMiddleware('1 minute'), matchController.getLiveMatches);
router.get('/completed', cacheMiddleware('1 hour'), matchController.getCompletedMatches);
router.get('/:id', cacheMiddleware('1 hour'), matchController.getMatch);
router.get('/league/:league', cacheMiddleware('1 hour'), matchController.getMatchesByLeague);
router.get('/season/:season', cacheMiddleware('1 hour'), matchController.getMatchesBySeason);

router.post('/', authenticate, matchController.createMatch);
router.put('/:id', authenticate, matchController.updateMatch);

export default router;