import { userRepository } from '../repositories/user.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { USER_ROLES } from '../utils/constants.js';

export class UserService {
  /**
   * List users with optional role, district, search filters and pagination
   */
  async listUsers(query = {}) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const { data, total } = await userRepository.findAll({
      role: query.role,
      district: query.district,
      limit,
      offset,
    });

    return {
      users: data.map((u) => ({
        id: u.id,
        authUserId: u.auth_user_id,
        email: u.email,
        fullName: u.full_name,
        phone: u.phone || null,
        role: u.role,
        district: u.district || null,
        block: u.block || null,
        isActive: u.is_active,
        lastLoginAt: u.last_login_at || null,
        createdAt: u.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single user by profile ID
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User '${id}'`);
    }
    return {
      id: user.id,
      authUserId: user.auth_user_id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone || null,
      role: user.role,
      district: user.district || null,
      block: user.block || null,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at || null,
      createdAt: user.created_at,
    };
  }

  /**
   * Admin creates a new user account with assigned role
   */
  async createUser(userData, actingUser) {
    const { email, password, full_name, phone, role = USER_ROLES.VIEWER, district, block } = userData;

    // Privilege escalation check: Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === USER_ROLES.SUPER_ADMIN && actingUser?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('Only a Super Admin can create or assign a Super Admin account');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Admin-created accounts are auto-verified
      user_metadata: { full_name },
    });

    if (authError || !authData.user) {
      throw new ValidationError(authError?.message || 'Failed to create user in identity provider');
    }

    const profile = await userRepository.createProfile({
      auth_user_id: authData.user.id,
      email,
      full_name,
      phone: phone || null,
      district: district || null,
      block: block || null,
      role,
    });

    await auditRepository.log({
      userId: actingUser?.id,
      action: 'ADMIN_USER_CREATED',
      entityType: 'USER',
      entityId: profile.id,
      newValue: { email, role, district },
    });

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      district: profile.district,
      block: profile.block,
      isActive: profile.is_active,
    };
  }

  /**
   * Update user details (name, phone, district, block)
   */
  async updateUser(id, updates, actingUser) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`User '${id}'`);
    }

    const updated = await userRepository.updateProfile(id, updates);

    await auditRepository.log({
      userId: actingUser?.id,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }

  /**
   * Activate or deactivate a user account
   */
  async updateUserStatus(id, isActive, actingUser) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`User '${id}'`);
    }

    const updated = await userRepository.updateStatus(id, isActive);

    await auditRepository.log({
      userId: actingUser?.id,
      action: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DISABLED',
      entityType: 'USER',
      entityId: id,
      oldValue: { is_active: existing.is_active },
      newValue: { is_active: isActive },
    });

    return updated;
  }

  /**
   * Assign new role or geographic scope to a user
   */
  async updateUserRole(id, role, district, block, assignedStationId, actingUser) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`User '${id}'`);
    }

    // Privilege escalation check: Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === USER_ROLES.SUPER_ADMIN && actingUser?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('Only a Super Admin can assign the Super Admin role');
    }

    const updated = await userRepository.updateRoleAndScope(id, { role, district, block });

    await auditRepository.log({
      userId: actingUser?.id,
      action: 'ROLE_CHANGED',
      entityType: 'USER',
      entityId: id,
      oldValue: { role: existing.role, district: existing.district },
      newValue: { role, district },
    });

    return updated;
  }

  /**
   * Soft deactivate a user
   */
  async deactivateUser(id, actingUser) {
    return this.updateUserStatus(id, false, actingUser);
  }
}

export const userService = new UserService();
