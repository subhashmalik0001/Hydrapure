import { authService } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, result, 'Authentication successful');
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refresh_token } = req.body;
      const result = await authService.refreshToken(refresh_token);
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await authService.logout(token);
      }
      return successResponse(res, { logged_out: true }, 'Successfully logged out');
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return successResponse(res, user, 'Current user profile retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
