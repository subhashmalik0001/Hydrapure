/**
 * HydraPure System Constants
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DISTRICT_OFFICER: 'DISTRICT_OFFICER',
  BLOCK_OFFICER: 'BLOCK_OFFICER',
  STATION_OPERATOR: 'STATION_OPERATOR',
  FIELD_TECHNICIAN: 'FIELD_TECHNICIAN',
  VIEWER: 'VIEWER',
};

export const STATION_STATUSES = {
  SAFE: 'SAFE',
  CAUTION: 'CAUTION',
  BLOCKED: 'BLOCKED',
  OFFLINE: 'OFFLINE',
  MAINTENANCE: 'MAINTENANCE',
};

export const OPERATIONAL_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  STANDBY: 'STANDBY',
  DECOMMISSIONED: 'DECOMMISSIONED',
};

export const CONNECTIVITY_STATUSES = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  INTERMITTENT: 'INTERMITTENT',
};

export const MEASUREMENT_STAGES = {
  RAW: 'RAW',
  TREATED: 'TREATED',
};

export const ALERT_SEVERITIES = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
};

export const ALERT_STATUSES = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
};

export const CONTROL_ACTIONS = {
  OPEN_SAFE_VALVE: 'OPEN_SAFE_VALVE',
  CLOSE_SAFE_VALVE: 'CLOSE_SAFE_VALVE',
  OPEN_DIVERT_VALVE: 'OPEN_DIVERT_VALVE',
  CLOSE_DIVERT_VALVE: 'CLOSE_DIVERT_VALVE',
  BLOCK_SUPPLY: 'BLOCK_SUPPLY',
  RESTORE_SUPPLY: 'RESTORE_SUPPLY',
  SYSTEM_RESET: 'SYSTEM_RESET',
};

export const ACTION_SOURCES = {
  AUTOMATIC: 'AUTOMATIC',
  MANUAL: 'MANUAL',
  IOT_DEVICE: 'IOT_DEVICE',
};

export const RISK_LEVELS = {
  SAFE: 'SAFE',       // 0-30
  CAUTION: 'CAUTION', // 31-60
  HIGH: 'HIGH',       // 61-80
  CRITICAL: 'CRITICAL', // 81-100
};

export const REPORT_TYPES = {
  QUALITY: 'Quality',
  PERFORMANCE: 'Performance',
  ALERTS: 'Alerts',
  SUMMARY: 'Summary',
  MAINTENANCE: 'Maintenance',
};

// Default BIS IS 10500:2012 Drinking Water Thresholds (Configurable Prototype Baseline)
export const DEFAULT_THRESHOLDS = {
  pH: {
    parameter: 'pH',
    min_value: 6.5,
    max_value: 8.5,
    warning_min: 6.2,
    warning_max: 8.8,
    critical_min: 5.5,
    critical_max: 9.5,
    unit: 'pH',
  },
  tds: {
    parameter: 'tds',
    min_value: 0,
    max_value: 500,
    warning_min: 0,
    warning_max: 750,
    critical_min: 0,
    critical_max: 1000,
    unit: 'ppm',
  },
  turbidity: {
    parameter: 'turbidity',
    min_value: 0,
    max_value: 1.0,
    warning_min: 0,
    warning_max: 5.0,
    critical_min: 0,
    critical_max: 10.0,
    unit: 'NTU',
  },
  temperature: {
    parameter: 'temperature',
    min_value: 10,
    max_value: 35,
    warning_min: 5,
    warning_max: 40,
    critical_min: 0,
    critical_max: 50,
    unit: '°C',
  },
  flow_rate: {
    parameter: 'flow_rate',
    min_value: 5.0,
    max_value: 30.0,
    warning_min: 2.0,
    warning_max: 35.0,
    critical_min: 0.0,
    critical_max: 50.0,
    unit: 'L/s',
  },
  residual_chlorine: {
    parameter: 'residual_chlorine',
    min_value: 0.2,
    max_value: 1.0,
    warning_min: 0.1,
    warning_max: 1.5,
    critical_min: 0.05,
    critical_max: 2.0,
    unit: 'mg/L',
  },
};
