import { stationRepository } from '../repositories/station.repository.js';
import { waterQualityRepository } from '../repositories/waterQuality.repository.js';
import { alertRepository } from '../repositories/alert.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { riskScoreService } from './riskScore.service.js';
import { NotFoundError } from '../utils/errors.js';
import { broadcastEvent } from '../sockets/socket.js';

export class StationService {
  async listStations(filters = {}) {
    const result = await stationRepository.findAll(filters);
    const stations = result.data || result.stations || (Array.isArray(result) ? result : []);
    const total = result.total !== undefined ? result.total : stations.length;
    return {
      stations,
      pagination: {
        total,
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 20,
      },
    };
  }

  async getStations(filters) {
    return this.listStations(filters);
  }

  async getStationById(id) {
    const station = await stationRepository.findById(id);
    if (!station) {
      throw new NotFoundError(`Water station '${id}'`);
    }

    const latestReading = await waterQualityRepository.getLatestReading(station.id, 'TREATED');
    const alerts = await alertRepository.findAll({ stationId: station.id, status: 'OPEN' });

    return {
      ...station,
      latestReading,
      activeAlertsCount: alerts.total || (Array.isArray(alerts) ? alerts.length : 0),
    };
  }

  async getStationLiveState(id) {
    const station = await stationRepository.findById(id);
    if (!station) {
      throw new NotFoundError(`Water station '${id}'`);
    }

    const [rawReading, treatedReading] = await Promise.all([
      waterQualityRepository.getLatestReading(station.id, 'RAW'),
      waterQualityRepository.getLatestReading(station.id, 'TREATED'),
    ]);

    const assessment = riskScoreService.calculateRisk(
      treatedReading || { ph: 7.2, tds: 180, turbidity: 1.2 },
      'TREATED'
    );

    return {
      station,
      raw: rawReading,
      treated: treatedReading,
      risk_score: assessment.risk_score,
      risk_level: assessment.risk_level,
      is_potable: assessment.is_potable,
      reasons: assessment.reasons,
      recommendations: assessment.recommendations,
      current_valve_status: station.status === 'BLOCKED' ? 'CLOSED' : 'OPEN',
      valve_state: station.status === 'BLOCKED' ? 'CLOSED' : 'OPEN',
      last_updated: new Date().toISOString(),
    };
  }

  async createStation(stationData, user) {
    const station = await stationRepository.create(stationData);

    await auditRepository.log({
      userId: user?.id || user,
      stationId: station.id,
      action: 'STATION_CREATED',
      entityType: 'WATER_STATION',
      entityId: station.id,
      newValue: station,
    });

    broadcastEvent('station:updated', { station, action: 'CREATED' });
    return station;
  }

  async updateStation(id, updates, user) {
    const existing = await stationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Water station '${id}'`);
    }

    const updated = await stationRepository.update(id, updates);

    await auditRepository.log({
      userId: user?.id || user,
      stationId: existing.id,
      action: 'STATION_UPDATED',
      entityType: 'WATER_STATION',
      entityId: existing.id,
      oldValue: existing,
      newValue: updated,
    });

    broadcastEvent('station:updated', { station: updated, action: 'UPDATED' });
    return updated;
  }

  async deleteStation(id, user) {
    const existing = await stationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Water station '${id}'`);
    }

    const deleted = await stationRepository.delete(id);

    await auditRepository.log({
      userId: user?.id || user,
      stationId: id,
      action: 'STATION_DECOMMISSIONED',
      entityType: 'WATER_STATION',
      entityId: id,
    });

    broadcastEvent('station:updated', { id, action: 'DELETED' });
    return deleted;
  }

  async controlValve(id, action, reason, user) {
    const station = await stationRepository.findById(id);
    if (!station) {
      throw new NotFoundError(`Water station '${id}'`);
    }

    let nextStatus = station.status;
    if (action === 'BLOCK_SUPPLY' || action === 'CLOSE_SAFE_VALVE') {
      nextStatus = 'BLOCKED';
    } else if (action === 'RESTORE_SUPPLY' || action === 'OPEN_SAFE_VALVE') {
      nextStatus = 'SAFE';
    }

    const updatedStation = await stationRepository.update(station.id, {
      status: nextStatus,
      valve_override: true,
      valve_override_reason: reason,
    });

    await auditRepository.log({
      userId: user?.id || user,
      stationId: station.id,
      action: `MANUAL_CONTROL_${action}`,
      entityType: 'WATER_STATION',
      entityId: station.id,
      newValue: { action, reason, nextStatus },
    });

    broadcastEvent('station:status-changed', {
      stationId: station.id,
      status: nextStatus,
      action,
    });

    return {
      success: true,
      station: updatedStation,
      action,
      reason,
      status: nextStatus,
    };
  }

  async executeControlAction(id, payload, user) {
    return this.controlValve(id, payload.action, payload.reason, user);
  }

  async getStationHistory(id, query = {}) {
    const station = await stationRepository.findById(id);
    if (!station) {
      throw new NotFoundError(`Water station '${id}'`);
    }

    const result = await waterQualityRepository.getTimeSeries({
      stationId: id,
      ...query,
    });

    return {
      history: Array.isArray(result) ? result : result.history || [],
      pagination: result.pagination || { total: result.length || 0, page: 1, limit: 50 },
    };
  }

  async getStationAlerts(id, query = {}) {
    return alertRepository.findAll({
      stationId: id,
      ...query,
    });
  }
}

export const stationService = new StationService();
