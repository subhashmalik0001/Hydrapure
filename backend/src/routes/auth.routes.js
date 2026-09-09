import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { loginSchema, registerSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/login',   authLimiter, validateBody(loginSchema),    authController.login);
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/refresh',  validateBody(refreshTokenSchema),          authController.refreshToken);
router.post('/forgot-password', authLimiter,                        authController.forgotPassword);
router.post('/reset-password',  validateBody(resetPasswordSchema),  authController.resetPassword);
router.post('/resend-verification', authLimiter,                    authController.resendVerification);

// Protected routes
router.post('/logout',  requireAuth, authController.logout);
router.get('/me',       requireAuth, authController.getCurrentUser);
router.patch('/profile', requireAuth, authController.updateProfile);

export default router;
