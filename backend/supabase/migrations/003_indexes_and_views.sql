-- ====================================================================
-- HydraPure Smart Water Monitoring & Purification System
-- Migration 003: Performance Indexes & Materialized Summary
-- ====================================================================

-- 1. WATER QUALITY READINGS INDEXES (Optimized for High Frequency Time-Series)
CREATE INDEX IF NOT EXISTS idx_readings_station_id 
  ON public.water_quality_readings(station_id);

CREATE INDEX IF NOT EXISTS idx_readings_recorded_at 
  ON public.water_quality_readings(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_readings_station_recorded 
  ON public.water_quality_readings(station_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_readings_stage 
  ON public.water_quality_readings(measurement_stage);

-- 2. ALERTS INDEXES
CREATE INDEX IF NOT EXISTS idx_alerts_station_id 
  ON public.alerts(station_id);

CREATE INDEX IF NOT EXISTS idx_alerts_status 
  ON public.alerts(status);

CREATE INDEX IF NOT EXISTS idx_alerts_severity 
  ON public.alerts(severity);

CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at 
  ON public.alerts(triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_status_severity 
  ON public.alerts(status, severity);

-- 3. WATER STATIONS INDEXES
CREATE INDEX IF NOT EXISTS idx_stations_code 
  ON public.water_stations(station_code);

CREATE INDEX IF NOT EXISTS idx_stations_district 
  ON public.water_stations(district);

CREATE INDEX IF NOT EXISTS idx_stations_block 
  ON public.water_stations(block);

CREATE INDEX IF NOT EXISTS idx_stations_status 
  ON public.water_stations(status);

CREATE INDEX IF NOT EXISTS idx_stations_connectivity 
  ON public.water_stations(connectivity_status);

-- 4. IOT DEVICES INDEXES
CREATE INDEX IF NOT EXISTS idx_iot_device_id 
  ON public.iot_devices(device_id);

CREATE INDEX IF NOT EXISTS idx_iot_api_key_hash 
  ON public.iot_devices(api_key_hash);

CREATE INDEX IF NOT EXISTS idx_iot_station_id 
  ON public.iot_devices(station_id);

-- 5. PROFILES & AUDIT LOGS INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_district 
  ON public.profiles(district);

CREATE INDEX IF NOT EXISTS idx_audit_created_at 
  ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_station_id 
  ON public.audit_logs(station_id);

CREATE INDEX IF NOT EXISTS idx_audit_user_id 
  ON public.audit_logs(user_id);
