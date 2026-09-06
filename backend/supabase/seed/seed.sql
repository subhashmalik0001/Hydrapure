-- ====================================================================
-- HydraPure Smart Water Monitoring & Purification System
-- Prototype Demonstration Seed Data (Jharkhand Mining & Rural Blocks)
-- ====================================================================

-- 1. Insert Default Configurable Water Quality Thresholds
INSERT INTO public.water_quality_thresholds 
  (parameter, min_value, max_value, warning_min, warning_max, critical_min, critical_max, unit, is_active)
VALUES
  ('pH', 6.5, 8.5, 6.2, 8.8, 5.5, 9.5, 'pH', true),
  ('tds', 0.0, 500.0, 0.0, 750.0, 0.0, 1000.0, 'ppm', true),
  ('turbidity', 0.0, 1.0, 0.0, 5.0, 0.0, 10.0, 'NTU', true),
  ('temperature', 10.0, 35.0, 5.0, 40.0, 0.0, 50.0, '°C', true),
  ('flow_rate', 5.0, 30.0, 2.0, 35.0, 0.0, 50.0, 'L/s', true),
  ('residual_chlorine', 0.2, 1.0, 0.1, 1.5, 0.05, 2.0, 'mg/L', true)
ON CONFLICT (parameter) DO NOTHING;

-- 2. Insert Default Demo Admin Profile
INSERT INTO public.profiles 
  (id, full_name, email, phone, role, district, block, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alok Yadav', 'admin@hydrapure.gov.in', '+91 94310 99999', 'SUPER_ADMIN', 'Dhanbad', 'Dhanbad Urban', true),
  ('00000000-0000-0000-0000-000000000002', 'Rajesh Kumar', 'operator.jharia@hydrapure.gov.in', '+91 94310 11111', 'STATION_OPERATOR', 'Dhanbad', 'Jharia', true),
  ('00000000-0000-0000-0000-000000000003', 'Sunita Sharma', 'officer.dhanbad@hydrapure.gov.in', '+91 94311 22222', 'DISTRICT_OFFICER', 'Dhanbad', 'Govindpur', true)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Prototype Water Stations across Jharkhand
INSERT INTO public.water_stations 
  (id, station_code, name, district, block, village, latitude, longitude, status, operational_status, connectivity_status, households_covered, last_seen_at)
VALUES
  ('11111111-1111-1111-1111-111111110001', 'WS-001', 'Jharia', 'Dhanbad', 'Jharia', 'Bastacola', 23.7441, 86.4131, 'SAFE', 'ACTIVE', 'ONLINE', 300, NOW()),
  ('11111111-1111-1111-1111-111111110002', 'WS-002', 'Govindpur', 'Dhanbad', 'Govindpur', 'Patherdih', 23.6324, 86.4579, 'SAFE', 'ACTIVE', 'ONLINE', 420, NOW()),
  ('11111111-1111-1111-1111-111111110003', 'WS-003', 'Baghmara', 'Dhanbad', 'Baghmara', 'Bhatdee', 23.8750, 86.1219, 'BLOCKED', 'ACTIVE', 'ONLINE', 280, NOW()),
  ('11111111-1111-1111-1111-111111110004', 'WS-004', 'Katras', 'Dhanbad', 'Katras', 'Kalipahari', 23.8050, 86.2950, 'CAUTION', 'ACTIVE', 'ONLINE', 350, NOW()),
  ('11111111-1111-1111-1111-111111110005', 'WS-005', 'Nirsa', 'Dhanbad', 'Nirsa', 'Mugma', 23.7844, 86.7119, 'SAFE', 'ACTIVE', 'ONLINE', 410, NOW()),
  ('11111111-1111-1111-1111-111111110006', 'WS-006', 'Sindri', 'Dhanbad', 'Sindri', 'Saharpura', 23.6499, 86.5050, 'CAUTION', 'ACTIVE', 'ONLINE', 390, NOW()),
  ('11111111-1111-1111-1111-111111110007', 'WS-007', 'Topchanchi', 'Dhanbad', 'Topchanchi', 'Gomoh', 23.9042, 86.2081, 'SAFE', 'ACTIVE', 'ONLINE', 260, NOW()),
  ('11111111-1111-1111-1111-111111110008', 'WS-008', 'Baliapur', 'Dhanbad', 'Baliapur', 'Pradhan Khanta', 23.7258, 86.5292, 'CAUTION', 'ACTIVE', 'ONLINE', 310, NOW())
ON CONFLICT (station_code) DO UPDATE SET
  status = EXCLUDED.status,
  last_seen_at = NOW();

-- 4. Insert Demo IoT Devices with SHA-256 Hashed Secrets
-- Plaintext defaults:
-- API Key: hp_iot_dev_key_jharkhand_2026 -> SHA256: 099e289bf5929656209ef4cb34fcf777e48b598b9f0aa38bf1dd4988feadca44
-- Secret: hp_secret_mesh_991827410 -> SHA256: dca863a43690d238217bb6640c490ff66d03f0b2f5670868f7aeef5777080ea4
INSERT INTO public.iot_devices
  (device_id, station_id, api_key_hash, device_secret_hash, is_active, firmware_version)
VALUES
  ('DEV-WS-001', '11111111-1111-1111-1111-111111110001', '099e289bf5929656209ef4cb34fcf777e48b598b9f0aa38bf1dd4988feadca44', 'dca863a43690d238217bb6640c490ff66d03f0b2f5670868f7aeef5777080ea4', true, '2.1.0'),
  ('DEV-WS-003', '11111111-1111-1111-1111-111111110003', '099e289bf5929656209ef4cb34fcf777e48b598b9f0aa38bf1dd4988feadca44', 'dca863a43690d238217bb6640c490ff66d03f0b2f5670868f7aeef5777080ea4', true, '2.1.0')
ON CONFLICT (device_id) DO NOTHING;

-- 5. Insert Demo Water Quality Readings
INSERT INTO public.water_quality_readings
  (station_id, recorded_at, measurement_stage, ph, tds, conductivity, turbidity, temperature, flow_rate, residual_chlorine, water_risk_score, risk_level)
VALUES
  ('11111111-1111-1111-1111-111111110001', NOW() - INTERVAL '10 minutes', 'RAW', 6.4, 680.0, 1100.0, 14.5, 25.2, 14.0, 0.0, 68, 'HIGH'),
  ('11111111-1111-1111-1111-111111110001', NOW() - INTERVAL '5 minutes', 'TREATED', 7.2, 310.0, 480.0, 1.2, 24.8, 12.5, 0.5, 12, 'SAFE'),
  ('11111111-1111-1111-1111-111111110003', NOW() - INTERVAL '3 minutes', 'TREATED', 5.9, 1500.0, 2400.0, 12.4, 26.1, 0.0, 0.1, 94, 'CRITICAL'),
  ('11111111-1111-1111-1111-111111110004', NOW() - INTERVAL '8 minutes', 'TREATED', 6.8, 820.0, 1300.0, 4.5, 25.0, 8.8, 0.4, 48, 'CAUTION');

-- 6. Insert Demo Incidents / Alerts
INSERT INTO public.alerts
  (station_id, alert_type, severity, parameter, value, threshold, message, status, triggered_at)
VALUES
  ('11111111-1111-1111-1111-111111110003', 'HIGH_TDS_BLOCK', 'CRITICAL', 'TDS', 1500.0, 500.0, 'Automatic valve closure engaged: TDS reading 1500 ppm exceeded BIS safety threshold of 500 ppm.', 'OPEN', NOW() - INTERVAL '3 minutes'),
  ('11111111-1111-1111-1111-111111110004', 'ELEVATED_TURBIDITY', 'WARNING', 'Turbidity', 4.5, 5.0, 'Turbidity approaching upper safety ceiling (4.5 NTU). Inspection advised.', 'OPEN', NOW() - INTERVAL '2 hours');

-- 7. Insert Demo Control Action
INSERT INTO public.station_control_actions
  (station_id, action, reason, source, status, executed_at)
VALUES
  ('11111111-1111-1111-1111-111111110003', 'BLOCK_SUPPLY', 'Automated solenoid cutoff triggered: Critical TDS (1500 ppm)', 'AUTOMATIC', 'COMPLETED', NOW() - INTERVAL '3 minutes');
