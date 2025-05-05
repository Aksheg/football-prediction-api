import { Router } from 'express';
import { LeagueController } from '../controllers/league.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
const leagueController = new LeagueController();

router.get('/public', cacheMiddleware('5 minutes'), leagueController.getPublicLeagues);
router.get('/:id', cacheMiddleware('1 hour'), leagueController.getLeague);

router.post('/', authenticate, leagueController.createLeague);
router.get('/user/myleagues', authenticate, leagueController.getUserLeagues);
router.post('/:id/join', authenticate, leagueController.joinLeague);
router.post('/:id/leave', authenticate, leagueController.leaveLeague);
router.delete('/:id', authenticate, leagueController.deleteLeague);
router.post('/:id/regenerate-invite', authenticate, leagueController.regenerateInviteCode);

export default router;