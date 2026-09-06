import { supabaseAdmin } from '../config/supabase.js';
import { DatabaseError } from '../utils/errors.js';
import { env } from '../config/env.js';

// In-memory fallback dataset for offline/mock development
let memoryStations = [
  { id: '11111111-1111-1111-1111-111111110001', station_code: 'WS-001', name: 'Jharia', district: 'Dhanbad', block: 'Jharia', village: 'Bastacola', latitude: 23.7441, longitude: 86.4131, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 300, installation_date: '2025-01-15', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110002', station_code: 'WS-002', name: 'Govindpur', district: 'Dhanbad', block: 'Govindpur', village: 'Patherdih', latitude: 23.6324, longitude: 86.4579, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 420, installation_date: '2025-02-10', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110003', station_code: 'WS-003', name: 'Baghmara', district: 'Dhanbad', block: 'Baghmara', village: 'Bhatdee', latitude: 23.8750, longitude: 86.1219, status: 'BLOCKED', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 280, installation_date: '2025-03-01', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110004', station_code: 'WS-004', name: 'Katras', district: 'Dhanbad', block: 'Katras', village: 'Kalipahari', latitude: 23.8050, longitude: 86.2950, status: 'CAUTION', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 350, installation_date: '2025-03-12', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110005', station_code: 'WS-005', name: 'Nirsa', district: 'Dhanbad', block: 'Nirsa', village: 'Mugma', latitude: 23.7844, longitude: 86.7119, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 410, installation_date: '2025-04-05', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110006', station_code: 'WS-006', name: 'Sindri', district: 'Dhanbad', block: 'Sindri', village: 'Saharpura', latitude: 23.6499, longitude: 86.5050, status: 'CAUTION', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 390, installation_date: '2025-04-20', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110007', station_code: 'WS-007', name: 'Topchanchi', district: 'Dhanbad', block: 'Topchanchi', village: 'Gomoh', latitude: 23.9042, longitude: 86.2081, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 260, installation_date: '2025-05-18', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11111111-1111-1111-1111-111111110008', station_code: 'WS-008', name: 'Baliapur', district: 'Dhanbad', block: 'Baliapur', village: 'Pradhan Khanta', latitude: 23.7258, longitude: 86.5292, status: 'CAUTION', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 310, installation_date: '2025-06-01', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const isMock = env.SUPABASE_URL.includes('mock-proj') || env.SUPABASE_ANON_KEY.includes('mock');

export class StationRepository {
  async findAll({ search, district, block, status, limit = 20, offset = 0 } = {}) {
    if (!isMock) {
      try {
        let query = supabaseAdmin.from('water_stations').select('*', { count: 'exact' });
        if (search) query = query.ilike('name', `%${search}%`);
        if (district && district !== 'All Districts') query = query.eq('district', district);
        if (block) query = query.eq('block', block);
        if (status && status !== 'All') query = query.eq('status', status.toUpperCase());

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (!error && data) {
          return { data, total: count || data.length };
        }
      } catch (err) {
        // Fall through to memory store
      }
    }

    // Memory fallback
    let results = [...memoryStations];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(s => s.name.toLowerCase().includes(q) || s.station_code.toLowerCase().includes(q));
    }
    if (district && district !== 'All Districts') {
      results = results.filter(s => s.district === district);
    }
    if (block) {
      results = results.filter(s => s.block === block);
    }
    if (status && status !== 'All') {
      results = results.filter(s => s.status === status.toUpperCase());
    }

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);
    return { data: paginated, total };
  }

  async findById(id) {
    if (!isMock) {
      try {
        const { data, error } = await supabaseAdmin
          .from('water_stations')
          .select('*')
          .or(`id.eq.${id},station_code.eq.${id}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        // Fall through
      }
    }
    return memoryStations.find(s => s.id === id || s.station_code === id) || null;
  }

  async create(stationData) {
    const newStation = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ws-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'SAFE',
      operational_status: 'ACTIVE',
      connectivity_status: 'ONLINE',
      ...stationData,
    };

    if (!isMock) {
      try {
        const { data, error } = await supabaseAdmin.from('water_stations').insert(newStation).select().single();
        if (!error && data) return data;
      } catch (err) {
        // Fall through
      }
    }

    memoryStations.unshift(newStation);
    return newStation;
  }

  async update(id, updates) {
    const updatedFields = { ...updates, updated_at: new Date().toISOString() };
    if (!isMock) {
      try {
        const { data, error } = await supabaseAdmin
          .from('water_stations')
          .update(updatedFields)
          .or(`id.eq.${id},station_code.eq.${id}`)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        // Fall through
      }
    }

    const idx = memoryStations.findIndex(s => s.id === id || s.station_code === id);
    if (idx === -1) return null;
    memoryStations[idx] = { ...memoryStations[idx], ...updatedFields };
    return memoryStations[idx];
  }

  async delete(id) {
    if (!isMock) {
      try {
        await supabaseAdmin.from('water_stations').delete().or(`id.eq.${id},station_code.eq.${id}`);
      } catch (err) {
        // Fall through
      }
    }
    const idx = memoryStations.findIndex(s => s.id === id || s.station_code === id);
    if (idx !== -1) {
      memoryStations.splice(idx, 1);
      return true;
    }
    return false;
  }

  async getCounts() {
    const total = memoryStations.length;
    const safe = memoryStations.filter(s => s.status === 'SAFE').length;
    const caution = memoryStations.filter(s => s.status === 'CAUTION').length;
    const blocked = memoryStations.filter(s => s.status === 'BLOCKED').length;
    const offline = memoryStations.filter(s => s.status === 'OFFLINE' || s.connectivity_status === 'OFFLINE').length;
    const households = memoryStations.reduce((sum, s) => sum + (s.households_covered || 0), 0);

    return { total, safe, caution, blocked, offline, households };
  }
}

export const stationRepository = new StationRepository();
