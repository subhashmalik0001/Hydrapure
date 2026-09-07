'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Presentation,
  Play,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Droplets,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  Video,
  FileText,
  Sliders,
  Maximize2,
  RefreshCw,
  Zap,
} from 'lucide-react'

export default function PitchPage() {
  const [playerMode, setPlayerMode] = useState<'drive' | 'local'>('drive')
  const [activeTab, setActiveTab] = useState<'overview' | 'problem' | 'solution' | 'impact'>('overview')

  const driveEmbedUrl = 'https://drive.google.com/file/d/18CCWsG9h2BJicUw_PZVlnCGi58H_cFgF/preview'
  const driveDirectUrl = 'https://drive.google.com/file/d/18CCWsG9h2BJicUw_PZVlnCGi58H_cFgF/view?usp=sharing'

  const chapters = [
    { time: '00:00', title: 'Introduction & Mission', desc: 'Water crisis & contamination challenges in Jharkhand' },
    { time: '01:15', title: 'Hardware & IoT Nodes', desc: 'ESP32 architecture, multi-sensor telemetry & power resilience' },
    { time: '02:40', title: 'Treatment & Purification', desc: 'Sedimentation, Activated Carbon, RO/UV & automated chlorination' },
    { time: '04:10', title: 'Live Dashboard & Analytics', desc: 'Real-time telemetry, geographic GIS mapping & instant alerts' },
    { time: '05:35', title: 'Automated Fail-Safe Cutoff', desc: 'Sub-second solenoid valve shutoff when thresholds are breached' },
    { time: '07:00', title: 'Scalability & Public Impact', desc: 'Expansion roadmap across 24 districts and rural schools' },
  ]

  const metrics = [
    { label: 'Pilot Stations', value: '8 Active', sub: 'Across 5 districts' },
    { label: 'Daily Safe Output', value: '1.2M L', sub: 'Treated drinking water' },
    { label: 'Fail-Safe Latency', value: '< 800ms', sub: 'Automated valve cutoff' },
    { label: 'Compliance Rate', value: '99.8%', sub: 'IS 10500:2012 standards' },
  ]

  return (
    <div className="pitch-container" style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <div className="page-heading" style={{ marginBottom: '24px' }}>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} />
            <span>EXECUTIVE PRESENTATION & DEMO</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#101820', marginTop: '6px', marginBottom: '8px' }}>
            HydraPure Platform Pitch & Video Walkthrough
          </h1>
          <p style={{ color: '#53616d', fontSize: '14px', maxWidth: '750px', lineHeight: '1.5' }}>
            Watch the complete system presentation showcasing IoT multi-sensor telemetry, multi-stage water purification pipeline, and real-time cloud fail-safe automation.
          </p>
        </div>

        <div className="heading-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={driveDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="export-button"
            style={{
              background: '#ffffff',
              border: '1px solid #d5dfe5',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ExternalLink size={14} />
            <span>Open in Google Drive</span>
          </a>

          <Link
            href="/"
            className="export-button"
            style={{
              background: '#155e75',
              color: '#ffffff',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        {metrics.map((m, idx) => (
          <div key={idx} className="kpi-card" style={{ minHeight: '130px', padding: '16px 20px' }}>
            <div className="kpi-label" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div className="kpi-value-row" style={{ marginTop: '8px' }}>
              <strong style={{ fontSize: '28px', color: '#101820' }}>{m.value}</strong>
            </div>
            <p style={{ marginTop: '6px', color: '#718092', fontSize: '12px' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Video Presentation Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'grid',
              placeItems: 'center',
            }}>
              <Video size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>System Pitch Video</h2>
              <span style={{ fontSize: '12px', color: '#718092' }}>High-definition demonstration with audio commentary</span>
            </div>
          </div>

          {/* Player Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f7', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setPlayerMode('drive')}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 600,
                background: playerMode === 'drive' ? '#ffffff' : 'transparent',
                color: playerMode === 'drive' ? '#155e75' : '#718092',
                boxShadow: playerMode === 'drive' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Cloud Stream (Google Drive)
            </button>
            <button
              onClick={() => setPlayerMode('local')}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 600,
                background: playerMode === 'local' ? '#ffffff' : 'transparent',
                color: playerMode === 'local' ? '#155e75' : '#718092',
                boxShadow: playerMode === 'local' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Local Player (/Video.mp4)
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          background: '#090d12',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 12px 36px -8px rgba(16, 24, 32, 0.25)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {playerMode === 'drive' ? (
            <iframe
              src={driveEmbedUrl}
              title="HydraPure Pitch Video - Google Drive Stream"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          ) : (
            <video
              src="/Video.mp4"
              controls
              playsInline
              preload="metadata"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            >
              Your browser does not support HTML5 video. Please switch to the Cloud Stream option.
            </video>
          )}
        </div>

        {/* Bottom player controls notice */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '14px',
          padding: '10px 14px',
          background: '#f8fafc',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            <span>
              {playerMode === 'drive'
                ? 'Streaming via Google Drive CDN. Use player controls for full-screen and playback speed.'
                : 'Playing high-bitrate local asset with hardware acceleration.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={driveDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#155e75', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <ExternalLink size={12} />
              <span>Full Screen Drive Link</span>
            </a>
          </div>
        </div>
      </div>

      {/* Chapters & Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Presentation Chapters */}
        <div className="card" style={{ padding: '22px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={18} style={{ color: '#155e75' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Pitch Agenda & Chapters</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chapters.map((ch, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #edf2f7',
                }}
              >
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: '700',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}>
                  {ch.time}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{ch.title}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{ch.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pitch Highlights Tabs */}
        <div className="card" style={{ padding: '22px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Layers size={18} style={{ color: '#155e75' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Executive Summary</h3>
          </div>

          {/* Subtabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f7', padding: '4px', borderRadius: '10px' }}>
            {(['overview', 'problem', 'solution', 'impact'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: activeTab === tab ? '#ffffff' : 'transparent',
                  color: activeTab === tab ? '#155e75' : '#718092',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>HydraPure</strong> is a mission-critical water purification and IoT analytics platform purpose-built for high-contamination groundwater environments in Jharkhand.
              </p>
              <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Continuous multi-parametric monitoring (pH, TDS, Turbidity, DO, ORP, Temp).</li>
                <li>Edge computing node with automated emergency solenoid valve shutoff in under 800ms.</li>
                <li>Central command telemetry dashboard with live WebSocket sync & predictive health alerts.</li>
                <li>Full compliance with Indian Standard IS 10500:2012 for potable drinking water.</li>
              </ul>
            </div>
          )}

          {activeTab === 'problem' && (
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>The Groundwater Crisis in Jharkhand:</strong>
              </p>
              <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Mining runoff in Dhanbad and Bokaro leads to lethal heavy metal leaching (Iron, Arsenic, Fluoride).</li>
                <li>Traditional rural water treatment plants rely on manual testing once a month, leaving communities vulnerable to contamination for weeks.</li>
                <li>Zero automated shut-off mechanisms when filter membranes fail or chlorine dosing drops.</li>
              </ul>
            </div>
          )}

          {activeTab === 'solution' && (
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>The HydraPure Triad Architecture:</strong>
              </p>
              <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Hardware Tier:</strong> Solar-buffered ESP32 controller with industrial RS485 Modbus water sensors.</li>
                <li><strong>Purification Pipeline:</strong> Sedimentation filter → Activated Carbon block → RO membrane → UV Sterilizer → Automated Chlorination.</li>
                <li><strong>Cloud Software:</strong> Next.js 15 analytics dashboard + Express/Supabase IoT ingestion engine.</li>
              </ul>
            </div>
          )}

          {activeTab === 'impact' && (
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Target Scalability & Deliverables:</strong>
              </p>
              <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Projected roll-out to 45 community centers across Dhanbad, Ranchi, Jamshedpur & Bokaro.</li>
                <li>Estimated 72% reduction in waterborne gastrointestinal illnesses within pilot wards.</li>
                <li>Carbon credit and filter lifecycle optimization, reducing operational costs by 38%.</li>
              </ul>
            </div>
          )}

          {/* Quick links footer inside card */}
          <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #edf2f7', display: 'flex', gap: '10px' }}>
            <Link
              href="/quality"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#155e75',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <Activity size={14} />
              <span>Explore Water Quality Analytics</span>
            </Link>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <Link
              href="/map"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#155e75',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span>View Map</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
