import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';

let memoryAlerts = [
  { id: 'alt-001', station_id: '11111111-1111-1111-1111-111111110003', station_name: 'Baghmara', district: 'Dhanbad', alert_type: 'HIGH_TDS_BLOCK', severity: 'CRITICAL', parameter: 'TDS', value: 1500.0, threshold: 500.0, message: 'Automated solenoid cutoff: TDS 1500 ppm exceeded limit', status: 'OPEN', triggered_at: new Date(Date.now() - 180000).toISOString(), created_at: new Date().toISOString() },
  { id: 'alt-002', station_id: '11111111-1111-1111-1111-111111110004', station_name: 'Katras', district: 'Dhanbad', alert_type: 'ELEVATED_TURBIDITY', severity: 'WARNING', parameter: 'Turbidity', value: 4.5, threshold: 5.0, message: 'Turbidity approaching warning ceiling (4.5 NTU)', status: 'OPEN', triggered_at: new Date(Date.now() - 7200000).toISOString(), created_at: new Date().toISOString() },
  { id: 'alt-003', station_id: '11111111-1111-1111-1111-111111110002', station_name: 'Govindpur', district: 'Dhanbad', alert_type: 'SYSTEM_RESTORED', severity: 'INFO', parameter: 'System', value: null, threshold: null, message: 'System telemetry restored to optimal parameters', status: 'RESOLVED', triggered_at: new Date(Date.now() - 14400000).toISOString(), resolved_at: new Date(Date.now() - 12000000).toISOString(), created_at: new Date().toISOString() },
];

let memoryControlActions = [
  { id: 'act-001', station_id: '11111111-1111-1111-1111-111111110003', action: 'BLOCK_SUPPLY', reason: 'Automatic solenoid cutoff triggered: Critical TDS (1500 ppm)', source: 'AUTOMATIC', status: 'COMPLETED', executed_at: new Date(Date.now() - 180000).toISOString() },
];

const isMock = env.SUPABASE_URL.includes('mock-proj') || env.SUPABASE_ANON_KEY.includes('mock');

export class AlertRepository {
  async findAll({ severity, status, stationId, limit = 20, offset = 0 }) {
    let list = [...memoryAlerts];
    if (severity && severity !== 'all') list = list.filter(a => a.severity === severity.toUpperCase());
    if (status && status !== 'all') list = list.filter(a => a.status === status.toUpperCase());
    if (stationId) list = list.filter(a => a.station_id === stationId);

    const total = list.length;
    const data = list.slice(offset, offset + limit);
    return { data, total };
  }

  async findById(id) {
    return memoryAlerts.find(a => a.id === id) || null;
  }

  async create(alertData) {
    const alert = {
      id: crypto.randomUUID ? crypto.randomUUID() : `alt-${Date.now()}`,
      status: 'OPEN',
      triggered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      ...alertData,
    };
    memoryAlerts.unshift(alert);
    return alert;
  }

  async acknowledge(id, userId) {
    const alert = memoryAlerts.find(a => a.id === id);
    if (!alert) return null;
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledged_at = new Date().toISOString();
    alert.acknowledged_by = userId;
    return alert;
  }

  async resolve(id, userId, resolutionNote) {
    const alert = memoryAlerts.find(a => a.id === id);
    if (!alert) return null;
    alert.status = 'RESOLVED';
    alert.resolved_at = new Date().toISOString();
    alert.resolved_by = userId;
    alert.resolution_note = resolutionNote || 'Resolved by operator';
    return alert;
  }

  async recordControlAction(actionData) {
    const action = {
      id: crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}`,
      executed_at: new Date().toISOString(),
      status: 'COMPLETED',
      ...actionData,
    };
    memoryControlActions.unshift(action);
    return action;
  }

  async getControlActions(stationId) {
    if (stationId) {
      return memoryControlActions.filter(a => a.station_id === stationId);
    }
    return memoryControlActions;
  }

  async getCounts() {
    const total = memoryAlerts.length;
    const critical = memoryAlerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
    const warning = memoryAlerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED').length;
    const info = memoryAlerts.filter(a => a.severity === 'INFO' && a.status !== 'RESOLVED').length;
    const resolved = memoryAlerts.filter(a => a.status === 'RESOLVED').length;

    return { total, critical, warning, info, resolved };
  }
}

export const alertRepository = new AlertRepository();
