import { userRepository } from '../repositories/user.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { NotFoundError } from '../utils/errors.js';

export class UserService {
  async getUsers(filters) {
    return userRepository.findAll(filters);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User '${id}'`);
    }
    return user;
  }

  async updateUserRole(id, role, adminUser) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`User '${id}'`);
    }

    const updated = await userRepository.updateProfile(id, { role });

    await auditRepository.log({
      userId: adminUser?.id,
      action: 'USER_ROLE_CHANGED',
      entityType: 'USER',
      entityId: id,
      oldValue: { role: existing.role },
      newValue: { role },
    });

    return updated;
  }
}

export const userService = new UserService();
