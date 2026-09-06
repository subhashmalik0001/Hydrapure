import cron from 'node-cron';
import { alertRepository } from '../repositories/alert.repository.js';
import { notificationService } from '../services/notification.service.js';
import { ALERT_SEVERITIES, ALERT_STATUSES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Alert escalation watchdog
 * Checks every 15 minutes for critical alerts that remain OPEN without acknowledgment
 */
export function startAlertEscalationJob() {
  return cron.schedule('*/15 * * * *', async () => {
    logger.info('[AlertJob] Checking for unacknowledged critical alerts...');

    try {
      const result = await alertRepository.findAll({
        status: ALERT_STATUSES.OPEN,
        severity: ALERT_SEVERITIES.CRITICAL,
      });
      const openCriticals = Array.isArray(result) ? result : result.data || [];

      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

      for (const alert of openCriticals) {
        const alertCreated = new Date(alert.created_at).getTime();
        if (alertCreated < thirtyMinutesAgo) {
          logger.warn(`[AlertJob] Escalating unresolved critical alert ${alert.id} for station ${alert.station_name}`);
          
          await notificationService.notifyCriticalBreach(alert, {
            id: alert.station_id,
            name: alert.station_name,
            district: alert.district,
          }, { escalated: true });
        }
      }
    } catch (err) {
      logger.error('[AlertJob] Error running alert escalation watchdog:', err);
    }
  });
}
