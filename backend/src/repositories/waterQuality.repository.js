import { supabaseAdmin } from '../config/supabase.js';
import { DEFAULT_THRESHOLDS } from '../utils/constants.js';
import { env } from '../config/env.js';

let memoryThresholds = Object.values(DEFAULT_THRESHOLDS).map(t => ({
  id: `thresh-${t.parameter}`,
  ...t,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

let memoryReadings = [
  { id: 'read-001', station_id: '11111111-1111-1111-1111-111111110001', recorded_at: new Date(Date.now() - 600000).toISOString(), measurement_stage: 'RAW', ph: 6.4, tds: 680, conductivity: 1100, turbidity: 14.5, temperature: 25.2, flow_rate: 14.0, residual_chlorine: 0.0, water_risk_score: 68, risk_level: 'HIGH', is_valid: true, created_at: new Date().toISOString() },
  { id: 'read-002', station_id: '11111111-1111-1111-1111-111111110001', recorded_at: new Date(Date.now() - 300000).toISOString(), measurement_stage: 'TREATED', ph: 7.2, tds: 310, conductivity: 480, turbidity: 1.2, temperature: 24.8, flow_rate: 12.5, residual_chlorine: 0.5, water_risk_score: 12, risk_level: 'SAFE', is_valid: true, created_at: new Date().toISOString() },
  { id: 'read-003', station_id: '11111111-1111-1111-1111-111111110003', recorded_at: new Date(Date.now() - 180000).toISOString(), measurement_stage: 'TREATED', ph: 5.9, tds: 1500, conductivity: 2400, turbidity: 12.4, temperature: 26.1, flow_rate: 0.0, residual_chlorine: 0.1, water_risk_score: 94, risk_level: 'CRITICAL', is_valid: true, created_at: new Date().toISOString() },
  { id: 'read-004', station_id: '11111111-1111-1111-1111-111111110004', recorded_at: new Date(Date.now() - 480000).toISOString(), measurement_stage: 'TREATED', ph: 6.8, tds: 820, conductivity: 1300, turbidity: 4.5, temperature: 25.0, flow_rate: 8.8, residual_chlorine: 0.4, water_risk_score: 48, risk_level: 'CAUTION', is_valid: true, created_at: new Date().toISOString() },
];

const isMock = env.SUPABASE_URL.includes('mock-proj') || env.SUPABASE_ANON_KEY.includes('mock');

export class WaterQualityRepository {
  async createReading(readingData) {
    const reading = {
      id: crypto.randomUUID ? crypto.randomUUID() : `read-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
      is_valid: true,
      ...readingData,
    };

    if (!isMock) {
      try {
        const { data, error } = await supabaseAdmin.from('water_quality_readings').insert(reading).select().single();
        if (!error && data) return data;
      } catch (err) {
        // Fall through
      }
    }

    memoryReadings.unshift(reading);
    return reading;
  }

  async findReadings({ stationId, stage, from, to, limit = 50, offset = 0 }) {
    if (!isMock) {
      try {
        let query = supabaseAdmin.from('water_quality_readings').select('*', { count: 'exact' });
        if (stationId) query = query.eq('station_id', stationId);
        if (stage) query = query.eq('measurement_stage', stage);
        if (from) query = query.gte('recorded_at', from);
        if (to) query = query.lte('recorded_at', to);

        const { data, count, error } = await query.order('recorded_at', { ascending: false }).range(offset, offset + limit - 1);
        if (!error && data) return { data, total: count || data.length };
      } catch (err) {
        // Fall through
      }
    }

    let list = [...memoryReadings];
    if (stationId) list = list.filter(r => r.station_id === stationId);
    if (stage) list = list.filter(r => r.measurement_stage === stage);
    if (from) list = list.filter(r => new Date(r.recorded_at) >= new Date(from));
    if (to) list = list.filter(r => new Date(r.recorded_at) <= new Date(to));

    const total = list.length;
    const data = list.slice(offset, offset + limit);
    return { data, total };
  }

  async getLatestReading(stationId, stage = 'TREATED') {
    const readings = memoryReadings
      .filter(r => (!stationId || r.station_id === stationId) && (!stage || r.measurement_stage === stage))
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    return readings[0] || null;
  }

  async getThresholds() {
    if (!isMock) {
      try {
        const { data, error } = await supabaseAdmin.from('water_quality_thresholds').select('*').eq('is_active', true);
        if (!error && data && data.length) return data;
      } catch (err) {
        // Fall through
      }
    }
    return memoryThresholds.filter(t => t.is_active);
  }

  async updateThreshold(idOrParam, updates) {
    const idx = memoryThresholds.findIndex(t => t.id === idOrParam || t.parameter.toLowerCase() === idOrParam.toLowerCase());
    if (idx !== -1) {
      memoryThresholds[idx] = { ...memoryThresholds[idx], ...updates, updated_at: new Date().toISOString() };
      return memoryThresholds[idx];
    }
    return null;
  }

  async getAverages() {
    const treated = memoryReadings.filter(r => r.measurement_stage === 'TREATED');
    const count = treated.length || 1;
    const avgPh = +(treated.reduce((s, r) => s + r.ph, 0) / count).toFixed(2);
    const avgTds = Math.round(treated.reduce((s, r) => s + r.tds, 0) / count);
    const avgTurbidity = +(treated.reduce((s, r) => s + r.turbidity, 0) / count).toFixed(2);
    const avgFlow = +(treated.reduce((s, r) => s + r.flow_rate, 0) / count).toFixed(1);

    return { avgPh, avgTds, avgTurbidity, avgFlow, totalReadings: memoryReadings.length };
  }
}

export const waterQualityRepository = new WaterQualityRepository();
