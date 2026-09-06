'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/context/AppContext'
import type { AlertLevel } from '@/lib/types'

export function useAlerts(options?: {
  level?: AlertLevel | 'all'
  district?: string
  resolved?: boolean
  query?: string
}) {
  const { alerts, resolveAlert } = useApp()

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (options?.level && options.level !== 'all' && a.level !== options.level) {
        return false
      }
      if (options?.district && options.district !== 'All Districts' && a.district !== options.district) {
        return false
      }
      if (options?.resolved !== undefined && a.resolved !== options.resolved) {
        return false
      }
      if (options?.query) {
        const q = options.query.toLowerCase().trim()
        const matches =
          a.title.toLowerCase().includes(q) ||
          a.stationName.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q) ||
          a.parameter.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [alerts, options?.level, options?.district, options?.resolved, options?.query])

  const counts = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.level === 'critical' && !a.resolved).length,
      warning: alerts.filter(a => a.level === 'warning' && !a.resolved).length,
      info: alerts.filter(a => a.level === 'info' && !a.resolved).length,
      resolved: alerts.filter(a => a.resolved).length,
    }
  }, [alerts])

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    counts,
    resolveAlert,
  }
}
