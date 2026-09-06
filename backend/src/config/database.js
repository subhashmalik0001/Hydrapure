import { supabaseAdmin } from './supabase.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Verifies Supabase connection health on server start
 */
export async function checkDatabaseConnection() {
  try {
    if (env.SUPABASE_URL.includes('mock-proj') || env.SUPABASE_ANON_KEY.includes('mock')) {
      logger.info('Database running in development mock-resilient mode.');
      return true;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const { data, error } = await supabaseAdmin
      .from('water_stations')
      .select('count', { count: 'exact', head: true })
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error && error.code !== 'PGRST116') {
      logger.warn(`Database connection check returned status: ${error.message}`);
      return false;
    }
    logger.info('Database connectivity established.');
    return true;
  } catch (err) {
    logger.warn(`Database connection check caught error: ${err.message}`);
    return false;
  }
}
