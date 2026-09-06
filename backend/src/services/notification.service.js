import { logger } from '../utils/logger.js';

/**
 * Multi-Channel Notification Dispatcher
 * Decouples notification channels (In-App, SMS, WhatsApp, Email, Push) from business logic.
 */
export class NotificationService {
  constructor() {
    this.inMemoryNotifications = [];
  }

  /**
   * Dispatches critical alerts across all registered channels
   */
  async notifyAlert(alert, station) {
    const notification = {
      id: `notif-${Date.now()}`,
      alert_id: alert.id,
      station_id: station?.id,
      station_name: station?.name,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date().toISOString(),
      channelsSent: [],
    };

    // 1. In-App Notification Stream
    this.inMemoryNotifications.unshift(notification);
    notification.channelsSent.push('IN_APP');

    // 2. Automated SMS Dispatch (to Jal Sahiya / Local Operator)
    if (alert.severity === 'CRITICAL') {
      await this.dispatchSms({
        to: '+919431099999',
        body: `[HYDRAPURE EMERGENCY] ${station?.name || 'Station'}: ${alert.message}. Supply auto-blocked.`,
      });
      notification.channelsSent.push('SMS');

      // 3. WhatsApp Integration (to Block Development Officer)
      await this.dispatchWhatsApp({
        to: '+919431122222',
        body: `🚨 *HydraPure Incident Report*\nStation: *${station?.name}* (${station?.district})\nAlert: ${alert.message}\nAction: Automatic Solenoid Valve Closed.`,
      });
      notification.channelsSent.push('WHATSAPP');
    }

    logger.info(`Notification dispatched for ${alert.severity} alert at station ${station?.name || alert.station_id}`, {
      alertId: alert.id,
      channels: notification.channelsSent,
    });

    return notification;
  }

  async notifyCriticalBreach(alert, station, options = {}) {
    return this.notifyAlert(alert, station);
  }

  async dispatchSms({ to, body }) {
    // Extensible SMS Gateway (e.g. NIC C-DAC / Twilio / MSG91)
    logger.info(`[SMS GATEWAY] Sending SMS to ${to}: "${body}"`);
    return { status: 'DISPATCHED', provider: 'SMS_GATEWAY' };
  }

  async dispatchWhatsApp({ to, body }) {
    // Extensible WhatsApp Business API
    logger.info(`[WHATSAPP API] Sending WhatsApp template to ${to}`);
    return { status: 'DISPATCHED', provider: 'WHATSAPP_CLOUD_API' };
  }

  async getRecentNotifications(limit = 20) {
    return this.inMemoryNotifications.slice(0, limit);
  }
}

export const notificationService = new NotificationService();
