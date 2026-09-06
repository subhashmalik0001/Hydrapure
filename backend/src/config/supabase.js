import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Supabase Clients for HydraPure Backend
 * 
 * supabaseAdmin: Uses SUPABASE_SERVICE_ROLE_KEY.
 * STRICTLY SERVER-SIDE ONLY. Bypasses Row Level Security (RLS) for backend services.
 * 
 * supabaseClient: Uses SUPABASE_ANON_KEY.
 * Respects Row Level Security policies.
 */

const isMock = env.SUPABASE_URL.includes('mock-proj') || env.SUPABASE_ANON_KEY.includes('mock');

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

if (isMock) {
  logger.warn('Supabase running with development fallback credentials. Real database sync will connect once valid SUPABASE_URL and KEYS are configured.');
} else {
  logger.info('Supabase client initialized successfully against ' + env.SUPABASE_URL);
}
