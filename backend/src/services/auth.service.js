import { supabaseClient, supabaseAdmin } from '../config/supabase.js';
import { userRepository } from '../repositories/user.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { AuthenticationError, ValidationError, ConflictError } from '../utils/errors.js';
import { env } from '../config/env.js';

export class AuthService {
  /**
   * Login with email and password via Supabase Auth
   */
  async login(firstArg, secondArg) {
    let email, password;
    if (typeof firstArg === 'object' && firstArg !== null) {
      email = firstArg.email;
      password = firstArg.password;
    } else {
      email = firstArg;
      password = secondArg;
    }

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    let authUser = null;
    let session = null;

    if (!env.SUPABASE_URL.includes('mock-proj')) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new AuthenticationError(error?.message || 'Invalid email or password');
      }
      authUser = data.user;
      session = data.session;
    } else {
      // Mock development fallback
      const profile = await userRepository.findByEmail(email);
      if (!profile) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check password in development mode
      const validPasswords = ['Password123!', 'Admin@123456', 'Password@123', 'OperatorPass@123'];
      if (!validPasswords.includes(password) && !password.startsWith('Pass')) {
        throw new AuthenticationError('Invalid email or password');
      }

      authUser = { id: profile.auth_user_id || profile.id, email: profile.email };
      session = {
        access_token: `mock_jwt_token_${profile.id}_${Date.now()}`,
        refresh_token: `mock_refresh_${Date.now()}`,
        expires_in: 3600,
        token_type: 'bearer',
      };
    }

    // Fetch user profile from public.profiles table
    let profile = await userRepository.findByAuthId(authUser.id);
    if (!profile) {
      profile = await userRepository.findByEmail(authUser.email);
    }

    await auditRepository.log({
      userId: profile?.id,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: authUser.id,
    });

    return {
      token: session?.access_token,
      user: {
        id: profile?.id || authUser.id,
        email: authUser.email,
        fullName: profile?.full_name || 'HydraPure User',
        role: profile?.role || 'VIEWER',
        district: profile?.district || null,
        block: profile?.block || null,
        phone: profile?.phone || null,
      },
      session: {
        accessToken: session?.access_token,
        refreshToken: session?.refresh_token,
        expiresIn: session?.expires_in,
      },
    };
  }

  /**
   * User Signup
   */
  async signup({ email, password, fullName, phone, district, block }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    let authUserId = null;
    if (!env.SUPABASE_URL.includes('mock-proj')) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (error || !data.user) {
        throw new ValidationError(error?.message || 'Failed to create auth user');
      }
      authUserId = data.user.id;
    } else {
      authUserId = `auth-${Date.now()}`;
    }

    const profile = await userRepository.createProfile({
      auth_user_id: authUserId,
      email,
      full_name: fullName,
      phone: phone || null,
      district: district || null,
      block: block || null,
      role: 'VIEWER',
    });

    return {
      message: 'Account created successfully',
      user: profile,
    };
  }

  async register(userData) {
    return this.signup({
      ...userData,
      fullName: userData.fullName || userData.full_name,
    });
  }

  /**
   * Get current authenticated profile
   */
  async getCurrentUser(authUserId) {
    const profile = await userRepository.findByAuthId(authUserId);
    if (!profile) {
      throw new AuthenticationError('Profile not found for authenticated user');
    }
    return profile;
  }
}

export const authService = new AuthService();
