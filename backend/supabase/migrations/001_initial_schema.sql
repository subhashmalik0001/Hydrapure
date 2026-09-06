-- ====================================================================
-- HydraPure Smart Water Monitoring & Purification System
-- Migration 001: Core Schema DDL
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'VIEWER' CHECK (
    role IN ('SUPER_ADMIN', 'ADMIN', 'DISTRICT_OFFICER', 'BLOCK_OFFICER', 'STATION_OPERATOR', 'FIELD_TECHNICIAN', 'VIEWER')
  ),
  district VARCHAR(100),
  block VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WATER STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.water_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  district VARCHAR(100) NOT NULL,
  block VARCHAR(100) NOT NULL,
  village VARCHAR(100),
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SAFE' CHECK (
    status IN ('SAFE', 'CAUTION', 'BLOCKED', 'OFFLINE', 'MAINTENANCE')
  ),
  operational_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (
    operational_status IN ('ACTIVE', 'INACTIVE', 'STANDBY', 'DECOMMISSIONED')
  ),
  connectivity_status VARCHAR(50) NOT NULL DEFAULT 'ONLINE' CHECK (
    connectivity_status IN ('ONLINE', 'OFFLINE', 'INTERMITTENT')
  ),
  installation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  households_covered INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. IOT DEVICES TABLE
CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id VARCHAR(100) UNIQUE NOT NULL,
  station_id UUID NOT NULL REFERENCES public.water_stations(id) ON DELETE CASCADE,
  api_key_hash VARCHAR(64) NOT NULL,
  device_secret_hash VARCHAR(64) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  firmware_version VARCHAR(50) DEFAULT '1.0.0',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WATER QUALITY THRESHOLDS (Configurable limits)
CREATE TABLE IF NOT EXISTS public.water_quality_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parameter VARCHAR(50) UNIQUE NOT NULL,
  min_value NUMERIC(10, 2) NOT NULL,
  max_value NUMERIC(10, 2) NOT NULL,
  warning_min NUMERIC(10, 2),
  warning_max NUMERIC(10, 2),
  critical_min NUMERIC(10, 2),
  critical_max NUMERIC(10, 2),
  unit VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WATER QUALITY READINGS (Raw & Treated Sensor Telemetry)
CREATE TABLE IF NOT EXISTS public.water_quality_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES public.water_stations(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  measurement_stage VARCHAR(50) NOT NULL DEFAULT 'TREATED' CHECK (
    measurement_stage IN ('RAW', 'TREATED')
  ),
  ph NUMERIC(5, 2) NOT NULL,
  tds NUMERIC(8, 2) NOT NULL,
  conductivity NUMERIC(8, 2),
  turbidity NUMERIC(6, 2) NOT NULL,
  temperature NUMERIC(5, 2) NOT NULL,
  flow_rate NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
  residual_chlorine NUMERIC(5, 2),
  water_risk_score INTEGER NOT NULL DEFAULT 0 CHECK (water_risk_score BETWEEN 0 AND 100),
  risk_level VARCHAR(50) NOT NULL DEFAULT 'SAFE' CHECK (
    risk_level IN ('SAFE', 'CAUTION', 'HIGH', 'CRITICAL')
  ),
  source_type VARCHAR(50) NOT NULL DEFAULT 'IOT_SENSOR',
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES public.water_stations(id) ON DELETE CASCADE,
  reading_id UUID REFERENCES public.water_quality_readings(id) ON DELETE SET NULL,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  parameter VARCHAR(50),
  value NUMERIC(10, 2),
  threshold NUMERIC(10, 2),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')),
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. STATION CONTROL ACTIONS (Audit log for valve operations)
CREATE TABLE IF NOT EXISTS public.station_control_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES public.water_stations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL CHECK (
    action IN ('OPEN_SAFE_VALVE', 'CLOSE_SAFE_VALVE', 'OPEN_DIVERT_VALVE', 'CLOSE_DIVERT_VALVE', 'BLOCK_SUPPLY', 'RESTORE_SUPPLY', 'SYSTEM_RESET')
  ),
  reason TEXT NOT NULL,
  triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'AUTOMATIC' CHECK (
    source IN ('AUTOMATIC', 'MANUAL', 'IOT_DEVICE')
  ),
  status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MAINTENANCE RECORDS
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES public.water_stations(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (
    status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
  ),
  filter_replaced BOOLEAN DEFAULT false,
  sensor_calibrated BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  station_id UUID REFERENCES public.water_stations(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMPLIANCE REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('Quality', 'Performance', 'Alerts', 'Summary', 'Maintenance')
  ),
  period VARCHAR(50) NOT NULL,
  district VARCHAR(100),
  station_id UUID REFERENCES public.water_stations(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Ready' CHECK (
    status IN ('Ready', 'Generating', 'Failed')
  ),
  file_url TEXT,
  generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automated updated_at Trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_water_stations_modtime
  BEFORE UPDATE ON public.water_stations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_iot_devices_modtime
  BEFORE UPDATE ON public.iot_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_thresholds_modtime
  BEFORE UPDATE ON public.water_quality_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
