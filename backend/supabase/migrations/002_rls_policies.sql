-- ====================================================================
-- HydraPure Smart Water Monitoring & Purification System
-- Migration 002: Row Level Security (RLS) & Access Policies
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_quality_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_quality_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_control_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current authenticated profile role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to fetch current authenticated profile district
CREATE OR REPLACE FUNCTION public.current_user_district()
RETURNS VARCHAR AS $$
  SELECT district FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ====================================================================
-- 2. POLICIES
-- ====================================================================

-- PROFILES POLICIES
-- Users can view their own profile; Admins/SuperAdmins can view all profiles
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT
  USING (auth_user_id = auth.uid() OR public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins manage profiles"
  ON public.profiles FOR ALL
  USING (public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- WATER STATIONS POLICIES
-- Authenticated users can view stations (District officers can view their district, Admins can view all)
CREATE POLICY "Authenticated users view water stations"
  ON public.water_stations FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'VIEWER') OR
      district = public.current_user_district() OR
      public.current_user_district() IS NULL
    )
  );

CREATE POLICY "Admins and officers modify water stations"
  ON public.water_stations FOR ALL
  USING (public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- WATER QUALITY READINGS POLICIES
-- Read-only for authenticated users
CREATE POLICY "Authenticated users view water readings"
  ON public.water_quality_readings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Backend Service Role handles reading insertion (Bypasses RLS)

-- ALERTS POLICIES
CREATE POLICY "Authenticated users view alerts"
  ON public.alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Operators and admins acknowledge and resolve alerts"
  ON public.alerts FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN', 'DISTRICT_OFFICER', 'BLOCK_OFFICER', 'STATION_OPERATOR', 'FIELD_TECHNICIAN')
  );

-- WATER QUALITY THRESHOLDS POLICIES
CREATE POLICY "Authenticated users view thresholds"
  ON public.water_quality_thresholds FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins modify thresholds"
  ON public.water_quality_thresholds FOR ALL
  USING (public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- REPORTS POLICIES
CREATE POLICY "Authenticated users view reports"
  ON public.reports FOR SELECT
  USING (auth.role() = 'authenticated');

-- AUDIT LOGS POLICIES
CREATE POLICY "Only SuperAdmins and Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.current_user_role() IN ('SUPER_ADMIN', 'ADMIN'));
