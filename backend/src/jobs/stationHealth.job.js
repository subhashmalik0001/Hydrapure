import cron from 'node-cron';
import { stationRepository } from '../repositories/station.repository.js';
import { alertRepository } from '../repositories/alert.repository.js';
import { ALERT_SEVERITIES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Watchdog job to monitor station connectivity
 * Flags stations as OFFLINE if no telemetry has arrived within 15 minutes
 */
export function startStationHealthJob() {
  // Run every 5 minutes
  return cron.schedule('*/5 * * * *', async () => {
    logger.info('[StationHealthJob] Running station connectivity watchdog check...');

    try {
      const res = await stationRepository.findAll();
      const stations = Array.isArray(res) ? res : (res?.data || []);
      const now = Date.now();
      const fifteenMinutesMs = 15 * 60 * 1000;
      const oneHourMs = 60 * 60 * 1000;

      for (const station of stations) {
        if (station.status === 'BLOCKED' || station.operational_status === 'DECOMMISSIONED') {
          continue;
        }

        const lastActivity = station.last_seen_at || station.updated_at || station.created_at;
        const lastActivityTime = new Date(lastActivity).getTime();
        const diffMs = now - lastActivityTime;

        if (diffMs > fifteenMinutesMs && station.status !== 'OFFLINE') {
          logger.warn(`[StationHealthJob] Station ${station.name} (${station.id}) has been silent for ${Math.round(diffMs / 60000)}m. Marking OFFLINE.`);
          
          await stationRepository.updateStatus(station.id, 'OFFLINE', {
            connectivity_status: 'OFFLINE',
          });

          // If silent for over an hour, generate a critical alert
          if (diffMs > oneHourMs) {
            await alertRepository.create({
              station_id: station.id,
              station_name: station.name,
              district: station.district,
              alert_type: 'COMMUNICATION_LOSS',
              severity: ALERT_SEVERITIES.WARNING,
              metric_name: 'heartbeat',
              message: `Station ${station.name} has not transmitted telemetry or heartbeat in over 60 minutes.`,
            });
          }
        }
      }
    } catch (err) {
      logger.error('[StationHealthJob] Error running station health check:', err);
    }
  });
}
