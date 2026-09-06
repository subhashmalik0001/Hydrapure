// ─── Station Types ──────────────────────────────────────────

export type StationStatus = 'SAFE' | 'CAUTION' | 'BLOCKED'
export type QualityStatus = 'Good' | 'Caution' | 'Poor'
export type Connectivity = 'Online' | 'Offline' | 'Intermittent'
export type AlertLevel = 'critical' | 'warning' | 'info' | 'resolved'
export type UserRole = 'admin' | 'operator' | 'technician'

export interface TreatmentStage {
  name: string
  status: 'Running' | 'Normal' | 'Good' | 'Idle' | 'Error'
  label: string
}

export interface WaterStation {
  id: string
  stationId: string
  name: string
  district: string
  state: string
  status: StationStatus
  qualityStatus: QualityStatus
  connectivity: Connectivity
  // Water quality parameters
  ph: number
  tds: number
  turbidity: number
  temperature: number
  flow: number
  chlorine: number
  // Metadata
  lastUpdate: string
  lastUpdateFull: string
  operator: string
  operatorPhone: string
  // Location
  latitude: number
  longitude: number
  nearbyAreas: string[]
  // Map position (percentage for SVG map)
  mapX: number
  mapY: number
  // Treatment
  treatmentStages: TreatmentStage[]
  // Supply
  supplyActive: boolean
  supplyFlowRate: number
  householdsCovered: number
  supplySince: string
}

export interface Alert {
  id: string
  level: AlertLevel
  stationId: string
  stationName: string
  district: string
  parameter: string
  title: string
  message: string
  value?: number
  threshold?: number
  unit?: string
  timestamp: string
  timestampFull: string
  resolved: boolean
  actionTaken?: string
  notifiedTo?: string
}

export interface Report {
  id: string
  title: string
  type: 'Quality' | 'Performance' | 'Alerts' | 'Summary'
  period: string
  generatedAt: string
  status: 'Ready' | 'Generating' | 'Pending'
}

export interface WaterQualityDataPoint {
  time: string
  ph: number
  tds: number
  turbidity: number
  temperature: number
  chlorine: number
}

export interface NavItem {
  icon: string
  label: string
  href: string
  roles: UserRole[]
}
