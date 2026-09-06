import { hashSecret } from '../utils/helpers.js';
import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';

let memoryDevices = [
  {
    id: 'dev-001',
    device_id: 'ESP32-JHARIA-01',
    station_id: '11111111-1111-1111-1111-111111110001',
    device_key: 'dev-key-jharia-secret-001',
    api_key_hash: hashSecret('dev-key-jharia-secret-001'),
    device_secret_hash: hashSecret('hp_secret_mesh_991827410'),
    status: 'ACTIVE',
    is_active: true,
    firmware_version: '2.1.0',
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'dev-002',
    device_id: 'DEV-WS-001',
    station_id: '11111111-1111-1111-1111-111111110001',
    device_key: 'hp_iot_dev_key_jharkhand_2026',
    api_key_hash: hashSecret('hp_iot_dev_key_jharkhand_2026'),
    device_secret_hash: hashSecret('hp_secret_mesh_991827410'),
    status: 'ACTIVE',
    is_active: true,
    firmware_version: '2.1.0',
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'dev-003',
    device_id: 'DEV-WS-003',
    station_id: '11111111-1111-1111-1111-111111110003',
    device_key: 'hp_iot_dev_key_jharkhand_2026',
    api_key_hash: hashSecret('hp_iot_dev_key_jharkhand_2026'),
    device_secret_hash: hashSecret('hp_secret_mesh_991827410'),
    status: 'ACTIVE',
    is_active: true,
    firmware_version: '2.1.0',
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export class DeviceRepository {
  async verifyDeviceKey(deviceId, deviceKey) {
    // If live Supabase is configured, check devices table
    if (!env.SUPABASE_URL.includes('mock-proj') && !env.SUPABASE_ANON_KEY.includes('mock')) {
      try {
        const { data, error } = await supabaseAdmin
          .from('devices')
          .select('*')
          .eq('device_id', deviceId)
          .single();

        if (!error && data) {
          const keyHash = hashSecret(deviceKey);
          if (data.api_key_hash === keyHash || data.device_key === deviceKey) {
            return data;
          }
        }
      } catch (err) {
        // fallback to memory
      }
    }

    // In-memory fallback
    const hashed = hashSecret(deviceKey);
    const found = memoryDevices.find(
      (d) =>
        d.device_id === deviceId &&
        d.is_active &&
        (d.device_key === deviceKey || d.api_key_hash === hashed)
    );

    return found || null;
  }

  async findByDeviceId(deviceId) {
    return memoryDevices.find((d) => d.device_id === deviceId && d.is_active) || null;
  }

  async findByStationId(stationId) {
    return memoryDevices.filter((d) => d.station_id === stationId);
  }

  async updateLastSeen(deviceId) {
    const dev = memoryDevices.find((d) => d.id === deviceId || d.device_id === deviceId);
    if (dev) {
      dev.last_seen_at = new Date().toISOString();
    }
  }

  async registerDevice(deviceData) {
    const dev = {
      id: `dev-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      status: 'ACTIVE',
      ...deviceData,
    };
    memoryDevices.push(dev);
    return dev;
  }
}

export const deviceRepository = new DeviceRepository();
