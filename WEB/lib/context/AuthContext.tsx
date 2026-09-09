'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser, AuthSession, LoginCredentials, SignupData, UserRole } from '@/lib/auth/auth.types'
import { toFrontendRole } from '@/lib/auth/auth.types'
import {
  loginApi,
  signupApi,
  logoutApi,
  getMeApi,
  refreshSessionApi,
} from '@/lib/auth/auth.service'
import {
  getSession,
  setSession,
  clearSession,
  isSessionExpired,
} from '@/lib/auth/session'
import { AuthLoading } from '@/components/auth/AuthLoading'

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<{ message: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSessionState] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isAuthenticated = !!user && !!session
  const role: UserRole = user ? toFrontendRole(user.role) : 'viewer'

  // ── Schedule next refresh before token expires ──────────────────────────────
  const scheduleRefresh = useCallback((authSession: AuthSession) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    const msUntilExpiry = authSession.expiresAt
      ? authSession.expiresAt * 1000 - Date.now()
      : authSession.expiresIn * 1000

    // Refresh 90 seconds before expiry
    const delay = Math.max(msUntilExpiry - 90_000, 30_000)

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const newSession = await refreshSessionApi(authSession.refreshToken)
        const stored = getSession()
        if (stored) {
          const updated = { ...stored, session: newSession }
          setSession(updated)
          setSessionState(newSession)
          scheduleRefresh(newSession)
        }
      } catch {
        // Refresh failed — log out
        clearSession()
        setUser(null)
        setSessionState(null)
        router.push('/login?expired=1')
      }
    }, delay)
  }, [router])

  // ── Restore session from sessionStorage on mount ────────────────────────────
  useEffect(() => {
    const restore = async () => {
      setIsLoading(true)
      const stored = getSession()
      if (!stored) {
        setIsLoading(false)
        return
      }

      const { session: storedSession, user: storedUser } = stored

      if (isSessionExpired(storedSession)) {
        try {
          const newSession = await refreshSessionApi(storedSession.refreshToken)
          const freshUser = await getMeApi(newSession.accessToken)
          setSession({ session: newSession, user: freshUser })
          setUser(freshUser)
          setSessionState(newSession)
          scheduleRefresh(newSession)
        } catch {
          clearSession()
        }
      } else {
        setUser(storedUser)
        setSessionState(storedSession)
        scheduleRefresh(storedSession)
        // Re-fetch fresh user profile in background
        getMeApi(storedSession.accessToken)
          .then((freshUser) => {
            setUser(freshUser)
            setSession({ session: storedSession, user: freshUser })
          })
          .catch(() => {})
      }

      setIsLoading(false)
    }

    restore()

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials)
    setSession({ session: result.session, user: result.user })
    setUser(result.user)
    setSessionState(result.session)
    scheduleRefresh(result.session)
  }, [scheduleRefresh])

  // ── Signup ──────────────────────────────────────────────────────────────────
  const signup = useCallback(async (data: SignupData) => {
    const result = await signupApi(data)
    return { message: result.message }
  }, [])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const token = session?.accessToken
    clearSession()
    setUser(null)
    setSessionState(null)
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    if (token) {
      logoutApi(token).catch(() => {})
    }
    router.push('/login')
  }, [session, router])

  // ── Manual refresh ──────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    const stored = getSession()
    if (!stored?.session.refreshToken) throw new Error('No session to refresh')
    const newSession = await refreshSessionApi(stored.session.refreshToken)
    const freshUser = await getMeApi(newSession.accessToken)
    setSession({ session: newSession, user: freshUser })
    setUser(freshUser)
    setSessionState(newSession)
    scheduleRefresh(newSession)
  }, [scheduleRefresh])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {isLoading ? <AuthLoading /> : children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
