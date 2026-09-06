import { deviceRepository } from '../repositories/device.repository.js';
import { stationRepository } from '../repositories/station.repository.js';
import { AuthenticationError, NotFoundError } from '../utils/errors.js';

/**
 * IoT Hardware Device Authentication Middleware
 * Enforces X-Device-Id and X-Device-Key verification for ESP32 telemetry ingestion
 */
export async function requireDeviceAuth(req, res, next) {
  try {
    const deviceId = req.headers['x-device-id'] || req.body.device_id;
    const deviceKey = req.headers['x-device-key'];

    if (!deviceId) {
      throw new AuthenticationError('Missing device identifier (X-Device-Id header or device_id payload)');
    }

    if (!deviceKey) {
      throw new AuthenticationError('Missing device security key in X-Device-Key header');
    }

    // Verify key against device registry
    const device = await deviceRepository.verifyDeviceKey(deviceId, deviceKey);
    if (!device) {
      throw new AuthenticationError('Invalid or revoked device credentials');
    }

    if (device.status === 'DECOMMISSIONED') {
      throw new AuthenticationError('Device has been decommissioned from active telemetry');
    }

    // Lookup associated station
    const station = await stationRepository.findById(device.station_id);
    if (!station) {
      throw new NotFoundError(`Assigned station ${device.station_id} not found`);
    }

    // Attach hardware context
    req.device = device;
    req.station = station;

    // Async update last_seen_at
    deviceRepository.updateLastSeen(device.id).catch(() => {});

    next();
  } catch (err) {
    next(err);
  }
}
