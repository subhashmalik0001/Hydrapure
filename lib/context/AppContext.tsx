'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { WaterStation, Alert, UserRole } from '@/lib/types'
import { stations as initialStations } from '@/lib/data/stations'
import { alerts as initialAlerts } from '@/lib/data/alerts'
import { getStationsApi, getAlertsApi, resolveAlertApi } from '@/lib/api/apiClient'

interface AppState {
  stations: WaterStation[]
  alerts: Alert[]
  role: UserRole
  setRole: (role: UserRole) => void
  lastSync: string
  syncData: () => Promise<void>
  isSyncing: boolean
  isBackendConnected: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  resolveAlert: (alertId: string) => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<WaterStation[]>(initialStations)
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [role, setRole] = useState<UserRole>('admin')
  const [lastSync, setLastSync] = useState('10:24 AM')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch initial data from live backend
  const refreshFromBackend = useCallback(async () => {
    setIsSyncing(true)
    try {
      const [stationRes, alertRes] = await Promise.all([
        getStationsApi(),
        getAlertsApi(),
      ])

      if (stationRes.isLive) {
        setStations(stationRes.stations)
        setIsBackendConnected(true)
      }
      if (alertRes.isLive) {
        setAlerts(alertRes.alerts)
      }

      const now = new Date()
      setLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      console.warn('[AppContext] Failed to refresh from backend, keeping current state:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    refreshFromBackend()
    // Poll backend every 30 seconds
    const interval = setInterval(refreshFromBackend, 30000)
    return () => clearInterval(interval)
  }, [refreshFromBackend])

  // Subtle real-time data fluctuations between poll intervals
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(s => {
        if (s.status === 'BLOCKED') return s
        const phDelta = (Math.random() - 0.5) * 0.04
        const tdsDelta = Math.round((Math.random() - 0.5) * 4)
        const turbDelta = +(((Math.random() - 0.5) * 0.06)).toFixed(2)
        const tempDelta = +(((Math.random() - 0.5) * 0.1)).toFixed(1)
        return {
          ...s,
          ph: +Math.max(5.0, Math.min(9.0, s.ph + phDelta)).toFixed(2),
          tds: Math.max(100, s.tds + tdsDelta),
          turbidity: +Math.max(0.1, s.turbidity + turbDelta).toFixed(2),
          temperature: +Math.max(20, Math.min(32, s.temperature + tempDelta)).toFixed(1),
        }
      }))
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const syncData = useCallback(async () => {
    await refreshFromBackend()
  }, [refreshFromBackend])

  const resolveAlert = useCallback(async (alertId: string) => {
    // Optimistic local update
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          resolved: true,
          level: 'resolved' as const,
          actionTaken: a.actionTaken || 'Marked as resolved by operator'
        }
      }
      return a
    }))

    // Sync to backend API
    await resolveAlertApi(alertId, 'Resolved by system operator from HydraPure dashboard')
  }, [])

  return (
    <AppContext.Provider value={{
      stations,
      alerts,
      role,
      setRole,
      lastSync,
      syncData,
      isSyncing,
      isBackendConnected,
      searchQuery,
      setSearchQuery,
      resolveAlert
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
