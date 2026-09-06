import crypto from 'crypto';

/**
 * Helper utility functions
 */

/**
 * Computes SHA-256 hash of API keys / device secrets
 */
export function hashSecret(secret) {
  if (!secret) return '';
  return crypto.createHash('sha256').update(String(secret)).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function verifySecret(secret, expectedHash) {
  if (!secret || !expectedHash) return false;
  const computed = hashSecret(secret);
  if (computed.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expectedHash));
}

/**
 * Great-circle distance between two GPS coordinates using Haversine formula (in km)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

/**
 * Strips sensitive keys (passwords, tokens, device secrets) from logs and outputs
 */
export function sanitizeLogData(data) {
  if (!data || typeof data !== 'object') return data;
  const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'device_secret', 'api_key', 'SUPABASE_SERVICE_ROLE_KEY'];
  const copy = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(copy)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      copy[key] = '***REDACTED***';
    } else if (typeof copy[key] === 'object' && copy[key] !== null) {
      copy[key] = sanitizeLogData(copy[key]);
    }
  }

  return copy;
}

export function parseCoordinates(lat, lon) {
  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  if (isNaN(parsedLat) || isNaN(parsedLon)) return null;
  return { latitude: parsedLat, longitude: parsedLon };
}
