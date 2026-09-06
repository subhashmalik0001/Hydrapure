import { alertRepository } from '../repositories/alert.repository.js';
import { stationRepository } from '../repositories/station.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { broadcastEvent } from '../sockets/socket.js';

export class AlertService {
  async getAlerts(filters) {
    const res = await alertRepository.findAll(filters);
    // Enrich with station details if missing
    for (const alert of res.data) {
      if (!alert.station_name && alert.station_id) {
        const s = await stationRepository.findById(alert.station_id);
        if (s) {
          alert.station_name = s.name;
          alert.district = s.district;
        }
      }
    }
    return res;
  }

  async getAlertById(id) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new NotFoundError(`Alert '${id}'`);
    }
    return alert;
  }

  async acknowledgeAlert(id, user) {
    const updated = await alertRepository.acknowledge(id, user?.id);
    if (!updated) {
      throw new NotFoundError(`Alert '${id}'`);
    }

    await auditRepository.log({
      userId: user?.id,
      stationId: updated.station_id,
      action: 'ALERT_ACKNOWLEDGED',
      entityType: 'ALERT',
      entityId: id,
    });

    broadcastEvent('alert:updated', updated);
    return updated;
  }

  async resolveAlert(id, resolutionNote, user) {
    const updated = await alertRepository.resolve(id, user?.id, resolutionNote);
    if (!updated) {
      throw new NotFoundError(`Alert '${id}'`);
    }

    await auditRepository.log({
      userId: user?.id,
      stationId: updated.station_id,
      action: 'ALERT_RESOLVED',
      entityType: 'ALERT',
      entityId: id,
      newValue: { resolutionNote },
    });

    broadcastEvent('alert:updated', updated);
    return updated;
  }

  async listAlerts(filters) {
    const res = await this.getAlerts(filters);
    return {
      alerts: res.data || [],
      pagination: {
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
      },
    };
  }

  async getAlertSummary() {
    return this.getSummary();
  }

  async getSummary() {
    return alertRepository.getCounts();
  }
}

export const alertService = new AlertService();
