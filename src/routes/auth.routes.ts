import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const authController = new AuthController();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

// router.get('/profile', authenticate, asyncHandler(authController.getProfile));

export default router;