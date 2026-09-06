import { userService } from '../services/user.service.js';
import { successResponse } from '../utils/response.js';

export class UserController {
  async listUsers(req, res, next) {
    try {
      const { users, pagination } = await userService.listUsers(req.query);
      return successResponse(res, users, 'Users retrieved', 200, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return successResponse(res, user, 'User retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, user, 'Profile updated');
    } catch (err) {
      next(err);
    }
  }

  async assignRole(req, res, next) {
    try {
      const { user_id, role, district, block, assigned_station_id } = req.body;
      const user = await userService.updateUserRole(
        user_id,
        role,
        district,
        block,
        assigned_station_id,
        req.user?.id
      );
      return successResponse(res, user, `User role updated to ${role}`);
    } catch (err) {
      next(err);
    }
  }

  async deactivateUser(req, res, next) {
    try {
      const user = await userService.deactivateUser(req.params.id, req.user?.id);
      return successResponse(res, user, 'User deactivated');
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
