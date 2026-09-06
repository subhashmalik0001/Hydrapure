'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Check,
  Eye,
  Filter,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { districts } from '@/lib/data/districts'
import type { Alert, AlertLevel } from '@/lib/types'
import StatusPill from '@/components/status/StatusPill'
import AlertDetailModal from '@/components/modals/AlertDetailModal'
import KpiCard from '@/components/cards/KpiCard'

export default function AlertsPage() {
  const { alerts, resolveAlert, searchQuery } = useApp()

  const [levelFilter, setLevelFilter] = useState<'all' | AlertLevel>('all')
  const [districtFilter, setDistrictFilter] = useState<string>('All Districts')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (levelFilter !== 'all') {
        if (levelFilter === 'resolved' && !a.resolved) return false
        if (levelFilter !== 'resolved' && (a.level !== levelFilter || a.resolved)) return false
      }
      if (districtFilter !== 'All Districts' && a.district !== districtFilter) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.stationName.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q) ||
          a.parameter.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [alerts, levelFilter, districtFilter, searchQuery])

  // Count summaries
  const criticalCount = alerts.filter(a => a.level === 'critical' && !a.resolved).length
  const warningCount = alerts.filter(a => a.level === 'warning' && !a.resolved).length
  const infoCount = alerts.filter(a => a.level === 'info' && !a.resolved).length
  const resolvedCount = alerts.filter(a => a.resolved).length

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">AUTOMATED TELEMETRY INCIDENTS</div>
          <h1>System Alerts</h1>
          <p>Real-time threshold trips, automated solenoid triggers, and operator work orders.</p>
        </div>
        <div className="heading-actions">
          <span className="online" style={{ color: criticalCount > 0 ? '#d45252' : '#18845b' }}>
            <i style={{ background: criticalCount > 0 ? '#d45252' : '#18845b', boxShadow: criticalCount > 0 ? '0 0 0 3px #fed7d7' : undefined }} />
            {criticalCount > 0 ? `${criticalCount} Action(s) Required` : 'All Systems Safe'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="kpi-grid">
        <KpiCard
          label="CRITICAL ALERTS"
          value={criticalCount}
          subtitle="Immediate action"
          description="High TDS/turbidity causing automatic shutoff"
          icon={XCircle}
          tone="blocked"
        />
        <KpiCard
          label="WARNINGS"
          value={warningCount}
          subtitle="Attention needed"
          description="Parameters near upper tolerance limits"
          icon={AlertTriangle}
          tone="caution"
        />
        <KpiCard
          label="INFORMATIONAL"
          value={infoCount}
          subtitle="System notes"
          description="Maintenance cycles & calibration alerts"
          icon={Info}
          tone="up"
        />
        <KpiCard
          label="RESOLVED"
          value={resolvedCount}
          subtitle="Cleared"
          description="Handled by field staff or auto-stabilized"
          icon={CheckCircle2}
          tone="safe"
        />
      </section>

      {/* Main Alerts Card */}
      <section className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Incident Activity Stream</h2>
            <p>Showing {filteredAlerts.length} matching incidents</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Filter by severity */}
            <div className="station-tabs" style={{ marginTop: 0 }}>
              {(['all', 'critical', 'warning', 'info', 'resolved'] as const).map(tab => (
                <button
                  key={tab}
                  className={levelFilter === tab ? 'selected' : ''}
                  onClick={() => setLevelFilter(tab)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filter by district */}
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              aria-label="Filter district"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#8b969e' }}>
              No incidents matching the selected criteria.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const tone = alert.level === 'critical' ? 'blocked' : alert.level === 'warning' ? 'caution' : alert.level === 'resolved' ? 'safe' : 'info'
              const Icon = alert.level === 'critical' ? XCircle : alert.level === 'warning' ? AlertTriangle : alert.level === 'resolved' ? CheckCircle2 : Info

              return (
                <div
                  key={alert.id}
                  className="alert-row"
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className={`alert-icon ${tone}`} style={{ width: 38, height: 38 }}>
                    <Icon size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <StatusPill status={alert.level} size="sm" />
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        {alert.stationName} ({alert.district})
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>• {alert.stationId}</span>
                    </div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                      {alert.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                      {alert.message} {alert.actionTaken ? `• Action: ${alert.actionTaken}` : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <time style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                        {alert.timestamp}
                      </time>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {alert.parameter} trigger
                      </span>
                    </div>

                    {!alert.resolved && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          resolveAlert(alert.id)
                        }}
                        style={{
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title="Mark as resolved"
                      >
                        <Check size={13} />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button className="icon-button" style={{ width: 32, height: 32 }} aria-label="View details">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Alert Inspection Dialog */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={resolveAlert}
      />
    </>
  )
}
