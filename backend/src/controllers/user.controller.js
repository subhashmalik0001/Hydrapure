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

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body, req.user);
      return successResponse(res, user, 'User account created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body, req.user);
      return successResponse(res, user, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { is_active } = req.body;
      const user = await userService.updateUserStatus(req.params.id, is_active, req.user);
      return successResponse(
        res,
        user,
        `User account ${is_active ? 'activated' : 'disabled'} successfully`
      );
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateUser(req.user.id, req.body, req.user);
      return successResponse(res, user, 'Profile updated');
    } catch (err) {
      next(err);
    }
  }

  async assignRole(req, res, next) {
    try {
      const targetUserId = req.params.id || req.body.user_id;
      const { role, district, block, assigned_station_id } = req.body;
      const user = await userService.updateUserRole(
        targetUserId,
        role,
        district,
        block,
        assigned_station_id,
        req.user
      );
      return successResponse(res, user, `User role updated to ${role}`);
    } catch (err) {
      next(err);
    }
  }

  async deactivateUser(req, res, next) {
    try {
      const user = await userService.deactivateUser(req.params.id, req.user);
      return successResponse(res, user, 'User deactivated');
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
