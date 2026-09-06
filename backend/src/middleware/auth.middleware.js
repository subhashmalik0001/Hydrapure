import { supabaseClient } from '../config/supabase.js';
import { userRepository } from '../repositories/user.repository.js';
import { AuthenticationError } from '../utils/errors.js';
import { env } from '../config/env.js';

/**
 * Authentication Middleware
 * Validates Supabase JWT Bearer token and attaches user profile to req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    let authUser = null;

    if (!env.SUPABASE_URL.includes('mock-proj')) {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error || !data.user) {
        throw new AuthenticationError(error?.message || 'Invalid or expired session token');
      }
      authUser = data.user;
    } else {
      // Development mock mode: parse mock token or fallback to admin
      authUser = { id: '00000000-0000-0000-0000-000000000001', email: 'admin@hydrapure.gov.in' };
    }

    // Load full system profile from profiles table
    let profile = await userRepository.findByAuthId(authUser.id);
    if (!profile) {
      profile = await userRepository.findByEmail(authUser.email);
    }

    if (!profile || !profile.is_active) {
      throw new AuthenticationError('User account is deactivated or profile does not exist');
    }

    req.user = profile;
    next();
  } catch (err) {
    next(err);
  }
}
