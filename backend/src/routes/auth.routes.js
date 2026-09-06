import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { loginSchema, registerSchema, refreshTokenSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);

export default router;
