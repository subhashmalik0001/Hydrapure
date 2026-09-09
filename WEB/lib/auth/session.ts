/**
 * Session management — stores auth tokens in memory + sessionStorage.
 * sessionStorage is cleared when the browser tab closes (more secure than localStorage).
 * A lightweight cookie `hp_auth=1` is also set so Next.js middleware can
 * check login state without reading sessionStorage (which is inaccessible in edge runtime).
 */
import type { AuthSession, AuthUser } from './auth.types'

const SESSION_KEY = 'hp_session'
const USER_KEY = 'hp_user'
const AUTH_COOKIE = 'hp_auth'

export interface StoredSession {
  session: AuthSession
  user: AuthUser
}

// ─── In-memory cache (fastest reads, no I/O) ─────────────────────────────────
let memSession: StoredSession | null = null

// ─── Storage helpers ──────────────────────────────────────────────────────────
function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

function setCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSec}; SameSite=Lax`
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function setSession(data: StoredSession): void {
  memSession = data
  const storage = safeStorage()
  if (storage) {
    try {
      storage.setItem(SESSION_KEY, JSON.stringify(data.session))
      storage.setItem(USER_KEY, JSON.stringify(data.user))
    } catch {
      // Storage quota — just use memory
    }
  }
  // Set cookie for middleware (just a presence marker, no sensitive data)
  const maxAge = data.session.expiresIn ?? 3600
  setCookie(AUTH_COOKIE, '1', maxAge)
}

export function getSession(): StoredSession | null {
  if (memSession) return memSession

  const storage = safeStorage()
  if (!storage) return null

  try {
    const session = storage.getItem(SESSION_KEY)
    const user = storage.getItem(USER_KEY)
    if (session && user) {
      const parsed: StoredSession = {
        session: JSON.parse(session),
        user: JSON.parse(user),
      }
      memSession = parsed
      return parsed
    }
  } catch {
    clearSession()
  }
  return null
}

export function clearSession(): void {
  memSession = null
  const storage = safeStorage()
  if (storage) {
    try {
      storage.removeItem(SESSION_KEY)
      storage.removeItem(USER_KEY)
    } catch {
      // Ignore
    }
  }
  deleteCookie(AUTH_COOKIE)
}

/**
 * Returns the current access token or null if not logged in
 */
export function getAccessToken(): string | null {
  return getSession()?.session.accessToken ?? null
}

/**
 * Returns true if the current session is expired
 */
export function isSessionExpired(session: AuthSession): boolean {
  if (!session.expiresAt) return false
  // expiresAt is a Unix timestamp in seconds from Supabase
  return Date.now() / 1000 > session.expiresAt - 60 // 60-second buffer
}
