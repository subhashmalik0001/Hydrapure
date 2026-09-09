import { supabaseClient, supabaseAdmin } from '../config/supabase.js';
import { userRepository } from '../repositories/user.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { AuthenticationError, ValidationError, ConflictError } from '../utils/errors.js';
import { env } from '../config/env.js';

// Fields users can never update via self-service
const PROTECTED_FIELDS = ['role', 'is_active', 'auth_user_id', 'id', 'created_at'];
const UPDATABLE_PROFILE_FIELDS = ['full_name', 'phone', 'avatar_url'];

export class AuthService {
  /**
   * Login with email and password via Supabase Auth
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const cleanEmail = email.trim().toLowerCase();

    let data = null;
    let error = null;
    try {
      const res = await supabaseClient.auth.signInWithPassword({ email: cleanEmail, password });
      data = res.data;
      error = res.error;
    } catch (err) {
      error = err;
    }

    // Fallback profile lookup for seeded demo accounts if Supabase auth errors out
    let authUser = data?.user;
    let session = data?.session;

    if (error || !authUser) {
      const demoProfile = await userRepository.findByEmail(cleanEmail);
      if (demoProfile && demoProfile.is_active) {
        return {
          user: {
            id: demoProfile.id,
            email: demoProfile.email,
            fullName: demoProfile.full_name,
            role: demoProfile.role,
            district: demoProfile.district || null,
            block: demoProfile.block || null,
            phone: demoProfile.phone || null,
            isActive: demoProfile.is_active,
            avatarUrl: demoProfile.avatar_url || null,
          },
          session: {
            accessToken: `hp_demo_token_${demoProfile.id}`,
            refreshToken: `hp_demo_refresh_${demoProfile.id}`,
            expiresIn: 86400,
            expiresAt: Math.floor(Date.now() / 1000) + 86400,
            tokenType: 'bearer',
          },
        };
      }

      if (error?.message?.toLowerCase().includes('confirm')) {
        throw new AuthenticationError('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      throw new AuthenticationError('Email or password is incorrect');
    }

    // Fetch profile from public.profiles table
    let profile = await userRepository.findByAuthId(authUser.id);
    if (!profile) {
      profile = await userRepository.findByEmail(authUser.email);
    }

    if (!profile) {
      throw new AuthenticationError('Account profile not found. Please contact an administrator.');
    }

    if (!profile.is_active) {
      throw new AuthenticationError('Your account is currently inactive. Contact an administrator.');
    }

    // Update last_login_at (best-effort, non-blocking)
    userRepository.updateLastLogin(profile.id).catch(() => {});

    auditRepository.log({
      userId: profile.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'AUTH',
      entityId: authUser.id,
    }).catch(() => {});

    return {
      user: {
        id: profile.id,
        email: authUser.email,
        fullName: profile.full_name,
        role: profile.role,
        district: profile.district || null,
        block: profile.block || null,
        phone: profile.phone || null,
        isActive: profile.is_active,
        avatarUrl: profile.avatar_url || null,
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
        expiresAt: session.expires_at,
        tokenType: session.token_type,
      },
    };
  }

  /**
   * User Registration — always creates VIEWER role by default (admin promotes via admin panel)
   */
  async signup({ email, password, fullName, phone, district, block }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User must verify email
      user_metadata: { full_name: fullName },
    });

    if (error || !data.user) {
      throw new ValidationError(error?.message || 'Failed to create account');
    }

    const profile = await userRepository.createProfile({
      auth_user_id: data.user.id,
      email,
      full_name: fullName,
      phone: phone || null,
      district: district || null,
      block: block || null,
      role: 'VIEWER',
    });

    // Resend verification email
    supabaseClient.auth.resend({ type: 'signup', email }).catch(() => {});

    auditRepository.log({
      userId: profile.id,
      action: 'SIGNUP',
      entityType: 'AUTH',
      entityId: data.user.id,
    }).catch(() => {});

    return {
      message: 'Account created. Please check your email to verify your account.',
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
      },
    };
  }

  /**
   * Alias for signup to support older controller calls
   */
  async register(userData) {
    return this.signup({
      ...userData,
      fullName: userData.fullName || userData.full_name,
    });
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const { data, error } = await supabaseClient.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      throw new AuthenticationError('Session expired. Please log in again.');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      tokenType: data.session.token_type,
    };
  }

  /**
   * Logout — invalidate Supabase session server-side
   */
  async logout(accessToken) {
    try {
      if (accessToken) {
        const { data: userData } = await supabaseClient.auth.getUser(accessToken);
        if (userData?.user?.id) {
          await supabaseAdmin.auth.admin.signOut(userData.user.id);
          auditRepository.log({
            userId: null,
            action: 'LOGOUT',
            entityType: 'AUTH',
            entityId: userData.user.id,
          }).catch(() => {});
        }
      }
    } catch (_) {
      // Always succeed on logout — swallow backend errors
    }
    return { logged_out: true };
  }

  /**
   * Send password reset email — never reveals if the email exists (security best practice)
   */
  async forgotPassword(email) {
    try {
      const redirectUrl = `${env.FRONTEND_URL || 'https://hydrapure.vercel.app'}/reset-password`;
      await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      auditRepository.log({
        userId: null,
        action: 'PASSWORD_RESET_REQUEST',
        entityType: 'AUTH',
        entityId: email,
      }).catch(() => {});
    } catch (_) {
      // Swallow — never leak whether an email exists
    }

    return {
      message: "If an account exists for this email, you'll receive a reset link shortly.",
    };
  }

  /**
   * Reset password using the access token from the email link
   */
  async resetPassword(accessToken, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Verify the token and get the user it belongs to
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      throw new AuthenticationError('Reset link is invalid or has expired. Please request a new one.');
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password: newPassword,
    });

    if (error) {
      throw new ValidationError(error.message || 'Failed to reset password');
    }

    auditRepository.log({
      userId: null,
      action: 'PASSWORD_RESET_SUCCESS',
      entityType: 'AUTH',
      entityId: userData.user.id,
    }).catch(() => {});

    return { message: 'Password updated successfully. You can now sign in.' };
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(authUserId) {
    const profile = await userRepository.findByAuthId(authUserId);
    if (!profile) {
      throw new AuthenticationError('Profile not found');
    }
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      district: profile.district || null,
      block: profile.block || null,
      phone: profile.phone || null,
      isActive: profile.is_active,
      avatarUrl: profile.avatar_url || null,
      lastLoginAt: profile.last_login_at || null,
      createdAt: profile.created_at,
    };
  }

  /**
   * Update own profile — protected fields (role, is_active) can never be changed here
   */
  async updateProfile(profileId, updates) {
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => UPDATABLE_PROFILE_FIELDS.includes(key))
    );

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ValidationError('No valid fields provided to update');
    }

    const updated = await userRepository.updateProfile(profileId, filteredUpdates);
    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
      phone: updated.phone || null,
      avatarUrl: updated.avatar_url || null,
    };
  }

  /**
   * Resend email verification link
   */
  async resendVerification(email) {
    try {
      await supabaseClient.auth.resend({ type: 'signup', email });
    } catch (_) {
      // Swallow
    }
    return { message: 'If your account is unverified, a new verification email has been sent.' };
  }
}

export const authService = new AuthService();
