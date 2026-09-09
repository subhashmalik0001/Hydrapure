// ─── Auth Types ──────────────────────────────────────────────────────────────
// Maps backend USER_ROLES to frontend-friendly structure

/** Backend role values as returned by the API */
export type BackendRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DISTRICT_OFFICER'
  | 'BLOCK_OFFICER'
  | 'STATION_OPERATOR'
  | 'FIELD_TECHNICIAN'
  | 'VIEWER'

/** Frontend dashboard UserRole — used for nav/RBAC rendering */
export type UserRole = 'admin' | 'operator' | 'technician' | 'viewer'

/** Maps backend roles to frontend UI roles */
export function toFrontendRole(backendRole: BackendRole): UserRole {
  switch (backendRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'DISTRICT_OFFICER':
    case 'BLOCK_OFFICER':
      return 'admin'
    case 'STATION_OPERATOR':
      return 'operator'
    case 'FIELD_TECHNICIAN':
      return 'technician'
    case 'VIEWER':
    default:
      return 'viewer'
  }
}

/** Returns display label for a backend role */
export function getRoleLabel(backendRole: BackendRole): string {
  const labels: Record<BackendRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrator',
    DISTRICT_OFFICER: 'District Officer',
    BLOCK_OFFICER: 'Block Officer',
    STATION_OPERATOR: 'Station Operator',
    FIELD_TECHNICIAN: 'Field Technician',
    VIEWER: 'Viewer',
  }
  return labels[backendRole] ?? backendRole
}

/** Returns avatar initials from full name */
export function getInitials(fullName?: string | null): string {
  if (!fullName) return 'HP'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: BackendRole
  district: string | null
  block: string | null
  phone: string | null
  isActive: boolean
  avatarUrl: string | null
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: number
  tokenType: string
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  /** Frontend role derived from backend role */
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  full_name: string
  phone?: string
  district?: string
  block?: string
}

export interface AuthError {
  message: string
  code?: string
}
