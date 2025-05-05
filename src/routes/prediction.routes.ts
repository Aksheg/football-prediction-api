import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
const predictionController = new PredictionController();

router.post('/', authenticate, predictionController.createPrediction);
router.get('/user', authenticate, predictionController.getUserPredictions);
router.get('/match/:matchId', cacheMiddleware('5 minutes'), predictionController.getMatchPredictions);

export default router;