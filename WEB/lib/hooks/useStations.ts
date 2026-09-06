'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/context/AppContext'
import type { StationStatus } from '@/lib/types'

export function useStations(options?: {
  district?: string
  status?: StationStatus | 'All'
  query?: string
}) {
  const { stations, lastSync, syncData, isSyncing } = useApp()

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      if (options?.district && options.district !== 'All Districts' && s.district !== options.district) {
        return false
      }
      if (options?.status && options.status !== 'All' && s.status !== options.status) {
        return false
      }
      if (options?.query) {
        const q = options.query.toLowerCase().trim()
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.stationId.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.operator.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [stations, options?.district, options?.status, options?.query])

  const stats = useMemo(() => {
    const total = stations.length
    const safe = stations.filter(s => s.status === 'SAFE').length
    const caution = stations.filter(s => s.status === 'CAUTION').length
    const blocked = stations.filter(s => s.status === 'BLOCKED').length
    const totalFlow = stations.reduce((acc, s) => acc + s.flow, 0)
    const avgPh = +(stations.reduce((acc, s) => acc + s.ph, 0) / (total || 1)).toFixed(2)
    const avgTds = Math.round(stations.reduce((acc, s) => acc + s.tds, 0) / (total || 1))
    const avgTurbidity = +(stations.reduce((acc, s) => acc + s.turbidity, 0) / (total || 1)).toFixed(2)
    const complianceRate = Math.round(((safe + caution * 0.5) / (total || 1)) * 100)

    return {
      total,
      safe,
      caution,
      blocked,
      totalFlow: +totalFlow.toFixed(1),
      avgPh,
      avgTds,
      avgTurbidity,
      complianceRate,
    }
  }, [stations])

  const getStationById = (id: string) => {
    return stations.find(s => s.id === id || s.stationId === id)
  }

  return {
    stations: filteredStations,
    allStations: stations,
    stats,
    getStationById,
    lastSync,
    syncData,
    isSyncing,
  }
}
