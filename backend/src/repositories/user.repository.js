import { supabaseAdmin } from '../config/supabase.js';
import { USER_ROLES } from '../utils/constants.js';

export class UserRepository {
  /**
   * Find profile by Supabase Auth UUID
   */
  async findByAuthId(authUserId) {
    if (!authUserId) return null;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    if (error || !data) return null;
    return data;
  }

  /**
   * Find profile by email address
   */
  async findByEmail(email) {
    if (!email) return null;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('email', email.toLowerCase())
      .single();
    if (error || !data) return null;
    return data;
  }

  /**
   * Find profile by internal profile UUID
   */
  async findById(id) {
    if (!id) return null;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data;
  }

  /**
   * Create a new profile in public.profiles table
   */
  async createProfile(profileData) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        auth_user_id: profileData.auth_user_id,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone || null,
        district: profileData.district || null,
        block: profileData.block || null,
        role: profileData.role || USER_ROLES.VIEWER,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create profile: ${error.message}`);
    return data;
  }

  /**
   * Update allowed profile fields (full_name, phone, avatar_url)
   */
  async updateProfile(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    return data;
  }

  /**
   * Update last login timestamp — best-effort, never throws
   */
  async updateLastLogin(id) {
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
  }

  /**
   * List all profiles with optional role/district filters
   */
  async findAll({ role, district, limit = 20, offset = 0 } = {}) {
    let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });
    if (role) query = query.eq('role', role);
    if (district) query = query.ilike('district', district);
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (error) throw new Error(`Failed to list profiles: ${error.message}`);
    return { data: data || [], total: count || 0 };
  }

  /**
   * Soft-deactivate or activate a user account
   */
  async deactivate(id) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(`Failed to deactivate user: ${error.message}`);
    return data;
  }

  /**
   * Update active status (enable/disable user)
   */
  async updateStatus(id, isActive) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(`Failed to update user status: ${error.message}`);
    return data;
  }

  /**
   * Update role and geographic scope (district, block)
   */
  async updateRoleAndScope(id, { role, district, block }) {
    const updates = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (district !== undefined) updates.district = district;
    if (block !== undefined) updates.block = block;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(`Failed to update user role and scope: ${error.message}`);
    return data;
  }
}

export const userRepository = new UserRepository();
