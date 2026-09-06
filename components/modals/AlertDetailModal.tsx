'use client'

import Link from 'next/link'
import type { Alert } from '@/lib/types'
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Clock,
  MapPin,
  Check,
} from 'lucide-react'
import StatusPill from '@/components/status/StatusPill'

interface AlertDetailModalProps {
  alert: Alert | null
  onClose: () => void
  onResolve?: (alertId: string) => void
}

export default function AlertDetailModal({
  alert,
  onClose,
  onResolve,
}: AlertDetailModalProps) {
  if (!alert) return null

  const getSeverityIcon = () => {
    switch (alert.level) {
      case 'critical':
        return <ShieldAlert className="text-red-500" />
      case 'warning':
        return <AlertTriangle className="text-amber-500" />
      case 'info':
        return <Info className="text-blue-500" />
      case 'resolved':
        return <CheckCircle2 className="text-emerald-500" />
      default:
        return <AlertCircle className="text-slate-500" />
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-subtitle">ALERT INSPECTION</span>
            <h2>{alert.title}</h2>
            <p>{alert.message}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X />
          </button>
        </div>

        <div className="modal-status-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getSeverityIcon()}
            <StatusPill status={alert.level} />
          </div>
          <span className="muted-text">ID: {alert.id}</span>
        </div>

        {/* Station & Location Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <div className="param-card">
            <div className="param-title">
              <MapPin />
              <span>Location / Station</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              {alert.stationName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              {alert.district} • {alert.stationId}
            </div>
          </div>

          <div className="param-card">
            <div className="param-title">
              <Clock />
              <span>Timestamp</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              {alert.timestamp}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
              {alert.timestampFull}
            </div>
          </div>
        </div>

        {/* Parameter Breakdown */}
        {alert.value !== undefined && (
          <div className="param-grid">
            <div className="param-card">
              <div className="param-title">
                <span>Recorded Value</span>
              </div>
              <div className="param-val" style={{ color: alert.level === 'critical' ? '#dc2626' : '#c48216' }}>
                {alert.value} <span className="unit">{alert.unit}</span>
              </div>
              <div className="param-status">
                Exceeded permissible limit
              </div>
            </div>

            <div className="param-card">
              <div className="param-title">
                <span>Safe Threshold Limit</span>
              </div>
              <div className="param-val">
                {alert.threshold} <span className="unit">{alert.unit}</span>
              </div>
              <div className="param-status">
                BIS 10500:2012 Standard
              </div>
            </div>
          </div>
        )}

        {/* Response Action Summary */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: 4 }}>
            AUTOMATED ACTION TAKEN
          </div>
          <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>
            {alert.actionTaken || (alert.resolved ? 'Resolved and verified normal' : 'Monitoring actively / Alert dispatched to local water committee')}
          </div>
          {alert.notifiedTo && (
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: 4 }}>
              Dispatched to: <strong>{alert.notifiedTo}</strong>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          {!alert.resolved && onResolve && (
            <button
              className="action-btn btn-unblock"
              onClick={() => {
                onResolve(alert.id)
                onClose()
              }}
            >
              <Check />
              <span>Mark Alert as Resolved</span>
            </button>
          )}

          <Link
            href={`/stations/${alert.stationId}`}
            className="action-btn btn-secondary"
            onClick={onClose}
          >
            <ExternalLink />
            <span>Go to {alert.stationName} Station Page</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
