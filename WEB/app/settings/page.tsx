'use client'

import { useState } from 'react'
import {
  Settings,
  Shield,
  Bell,
  Cpu,
  User,
  Save,
  CheckCircle2,
  Sliders,
  Radio,
  Lock,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import type { UserRole } from '@/lib/types'

export default function SettingsPage() {
  const { role, setRole } = useApp()

  // Form states
  const [tdsLimit, setTdsLimit] = useState(500)
  const [phMin, setPhMin] = useState(6.5)
  const [phMax, setPhMax] = useState(8.5)
  const [turbLimit, setTurbLimit] = useState(5.0)
  const [pollInterval, setPollInterval] = useState(30)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(true)
  const [autoShutoff, setAutoShutoff] = useState(true)
  const [savedNotice, setSavedNotice] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedNotice(true)
    setTimeout(() => {
      setSavedNotice(false)
    }, 3000)
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONFIGURATION & POLICY ENGINE</div>
          <h1>System Settings</h1>
          <p>Configure automated solenoid trip thresholds, telemetry polling intervals, and operator access.</p>
        </div>
        <div className="heading-actions">
          {savedNotice && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Settings updated successfully</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Section 1: Automated Shutoff Thresholds */}
          <section className="card">
            <div className="card-header">
              <div>
                <h2>Automated Valve Interventions</h2>
                <p>Solenoid valves close automatically when readings exceed these bounds</p>
              </div>
              <Shield size={18} color="#155e75" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                  <span>TDS Block Threshold (ppm)</span>
                  <span style={{ color: '#155e75' }}>{tdsLimit} ppm</span>
                </label>
                <input
                  type="range"
                  min={300}
                  max={1200}
                  step={25}
                  value={tdsLimit}
                  onChange={e => setTdsLimit(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#155e75' }}
                />
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  BIS standard maximum permissible: 500 ppm
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                    Minimum pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={phMin}
                    onChange={e => setPhMin(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                    Maximum pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={phMax}
                    onChange={e => setPhMax(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                  <span>Max Turbidity (NTU)</span>
                  <span style={{ color: '#155e75' }}>{turbLimit} NTU</span>
                </label>
                <input
                  type="range"
                  min={1.0}
                  max={15.0}
                  step={0.5}
                  value={turbLimit}
                  onChange={e => setTurbLimit(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#155e75' }}
                />
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  Drinking water limit: 5.0 NTU (IS 10500)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #edf1f3', paddingTop: 14 }}>
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>Automatic Solenoid Actuation</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Lock supply pipe immediately without manual approval</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoShutoff}
                  onChange={e => setAutoShutoff(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#155e75' }}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Telemetry & Mesh Rates */}
          <section className="card">
            <div className="card-header">
              <div>
                <h2>IoT Node Telemetry Rates</h2>
                <p>Sensor sample rates and solar battery power optimization</p>
              </div>
              <Cpu size={18} color="#155e75" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                  Sensor Telemetry Heartbeat (seconds)
                </label>
                <select
                  value={pollInterval}
                  onChange={e => setPollInterval(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value={15}>15 seconds (High Frequency - Solar Boosted)</option>
                  <option value={30}>30 seconds (Standard Standard Profile)</option>
                  <option value={60}>60 seconds (Power Saving Mode)</option>
                  <option value={300}>5 minutes (Low Battery Fallback)</option>
                </select>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: 4, display: 'block' }}>
                  Node transmits pH, TDS, Turbidity, Temp, Outflow over 4G LTE-M / LoRaWAN
                </span>
              </div>

              <div style={{ borderTop: '1px solid #edf1f3', paddingTop: 14 }}>
                <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: 8 }}>
                  Active Sensor Calibration Date
                </strong>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '11px', color: '#475569' }}>
                  Latest Batch Certification: <b>28 Aug 2026</b><br />
                  Next Mandatory Calibration: <b>28 Feb 2027</b>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #edf1f3', paddingTop: 14 }}>
                <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: 8 }}>
                  Role & Access Control
                </strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['admin', 'operator', 'technician'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: role === r ? '#101820' : '#f1f5f9',
                        color: role === r ? 'white' : '#475569',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: 6, display: 'block' }}>
                  Switching role changes navigation items in the sidebar. Current: <b>{role.toUpperCase()}</b>
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Dispatch & Notifications */}
          <section className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div>
                <h2>Emergency Dispatch & Incident Notifications</h2>
                <p>Configure automated multi-channel escalations when safety boundaries are breached</p>
              </div>
              <Bell size={18} color="#155e75" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>SMS Alerts to Jal Sahiya & Operators</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Instant Hindi & English SMS when TDS &gt; 500 ppm</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={e => setSmsAlerts(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#155e75' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>WhatsApp to Block Development Officer</strong>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Sends geolocation and auto-valve shutoff report</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={e => setWhatsappAlerts(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#155e75' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="export-button"
                style={{ background: '#101820', color: 'white', padding: '10px 20px', fontWeight: 600 }}
              >
                <Save size={14} />
                <span>Save All Settings</span>
              </button>
            </div>
          </section>
        </div>
      </form>
    </>
  )
}
