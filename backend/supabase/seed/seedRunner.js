import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../../src/config/supabase.js';
import { logger } from '../../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  logger.info('Starting HydraPure database seed runner...');
  try {
    const seedSqlPath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(seedSqlPath, 'utf8');

    // In Supabase, executing raw multi-statement SQL can be done via RPC or table API
    // We execute table-level idempotent seeding directly using supabaseAdmin
    logger.info('Executing prototype data seeding into Supabase...');

    // 1. Thresholds
    const thresholds = [
      { parameter: 'pH', min_value: 6.5, max_value: 8.5, warning_min: 6.2, warning_max: 8.8, critical_min: 5.5, critical_max: 9.5, unit: 'pH', is_active: true },
      { parameter: 'tds', min_value: 0.0, max_value: 500.0, warning_min: 0.0, warning_max: 750.0, critical_min: 0.0, critical_max: 1000.0, unit: 'ppm', is_active: true },
      { parameter: 'turbidity', min_value: 0.0, max_value: 1.0, warning_min: 0.0, warning_max: 5.0, critical_min: 0.0, critical_max: 10.0, unit: 'NTU', is_active: true },
      { parameter: 'temperature', min_value: 10.0, max_value: 35.0, warning_min: 5.0, warning_max: 40.0, critical_min: 0.0, critical_max: 50.0, unit: '°C', is_active: true },
      { parameter: 'flow_rate', min_value: 5.0, max_value: 30.0, warning_min: 2.0, warning_max: 35.0, critical_min: 0.0, critical_max: 50.0, unit: 'L/s', is_active: true },
      { parameter: 'residual_chlorine', min_value: 0.2, max_value: 1.0, warning_min: 0.1, warning_max: 1.5, critical_min: 0.05, critical_max: 2.0, unit: 'mg/L', is_active: true },
    ];
    await supabaseAdmin.from('water_quality_thresholds').upsert(thresholds, { onConflict: 'parameter' });

    // 2. Stations
    const stations = [
      { id: '11111111-1111-1111-1111-111111110001', station_code: 'WS-001', name: 'Jharia', district: 'Dhanbad', block: 'Jharia', village: 'Bastacola', latitude: 23.7441, longitude: 86.4131, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 300 },
      { id: '11111111-1111-1111-1111-111111110002', station_code: 'WS-002', name: 'Govindpur', district: 'Dhanbad', block: 'Govindpur', village: 'Patherdih', latitude: 23.6324, longitude: 86.4579, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 420 },
      { id: '11111111-1111-1111-1111-111111110003', station_code: 'WS-003', name: 'Baghmara', district: 'Dhanbad', block: 'Baghmara', village: 'Bhatdee', latitude: 23.8750, longitude: 86.1219, status: 'BLOCKED', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 280 },
      { id: '11111111-1111-1111-1111-111111110004', station_code: 'WS-004', name: 'Katras', district: 'Dhanbad', block: 'Katras', village: 'Kalipahari', latitude: 23.8050, longitude: 86.2950, status: 'CAUTION', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 350 },
      { id: '11111111-1111-1111-1111-111111110005', station_code: 'WS-005', name: 'Nirsa', district: 'Dhanbad', block: 'Nirsa', village: 'Mugma', latitude: 23.7844, longitude: 86.7119, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 410 },
      { id: '11111111-1111-1111-1111-111111110006', station_code: 'WS-006', name: 'Sindri', district: 'Dhanbad', block: 'Sindri', village: 'Saharpura', latitude: 23.6499, longitude: 86.5050, status: 'CAUTION', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 390 },
      { id: '11111111-1111-1111-1111-111111110007', station_code: 'WS-007', name: 'Topchanchi', district: 'Dhanbad', block: 'Topchanchi', village: 'Gomoh', latitude: 23.9042, longitude: 86.2081, status: 'SAFE', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 260 },
      { id: '11111111-1111-1111-1111-111111110008', station_code: 'WS-008', name: 'Baliapur', district: 'Dhanbad', block: 'Baliapur', village: 'Pradhan Khanta', latitude: 23.7258, longitude: 86.5292, status: 'CAUTION', operational_status: 'ACTIVE', connectivity_status: 'ONLINE', households_covered: 310 },
    ];
    await supabaseAdmin.from('water_stations').upsert(stations, { onConflict: 'station_code' });

    logger.info('Database seeded successfully with 8 Jharkhand stations and thresholds.');
  } catch (err) {
    logger.error(`Seed execution failed: ${err.message}`);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed().then(() => process.exit(0));
}

export { runSeed };
