'use client'

import { useState } from 'react'
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  FileCheck,
  Building,
  ShieldCheck,
  Printer,
} from 'lucide-react'
import { reports as initialReports } from '@/lib/data/reports'
import type { Report } from '@/lib/types'
import KpiCard from '@/components/cards/KpiCard'

export default function ReportsPage() {
  const [reportsList, setReportsList] = useState<Report[]>(initialReports)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportType, setReportType] = useState<'Quality' | 'Performance' | 'Alerts' | 'Summary'>('Quality')
  const [reportMonth, setReportMonth] = useState('Aug 2026')

  const handleGenerateReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const newReport: Report = {
        id: `RPT-00${reportsList.length + 1}`,
        title: `${reportType} Dossier — ${reportMonth}`,
        type: reportType,
        period: reportMonth,
        generatedAt: 'Just now',
        status: 'Ready',
      }
      setReportsList(prev => [newReport, ...prev])
      setIsGenerating(false)
    }, 1200)
  }

  const handleDownload = (report: Report) => {
    const textContent = `HYDRAPURE COMPLIANCE DOSSIER\n\nTitle: ${report.title}\nReport ID: ${report.id}\nCategory: ${report.type}\nReporting Period: ${report.period}\nGenerated: ${report.generatedAt}\nStandard: BIS IS 10500:2012 Drinking Water Specification\n\nEXECUTIVE SUMMARY:\n- Monitored 8 active filtration hubs across Dhanbad and Jharkhand coalfields.\n- Overall compliance rate: 92.4%.\n- Critical automatic valve interventions: 2 instances (TDS > 1400 ppm).\n- Total safe volume supplied: 12.8 Million Litres.\n\nCertified by: State Water Sanitation Mission (SWSM) & Hydrapure IoT Telemetry Engine.`

    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.id}-${report.title.toLowerCase().replace(/\s+/g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">REGULATORY AUDITS & DOCUMENT ARCHIVE</div>
          <h1>Compliance Reports</h1>
          <p>Download certified water safety records, station operational audits, and Jal Jeevan Mission submissions.</p>
        </div>
        <div className="heading-actions">
          <button
            className="export-button"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            style={{ background: '#101820', color: 'white' }}
          >
            <Plus size={14} />
            <span>{isGenerating ? 'Compiling Telemetry...' : 'Generate New Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="kpi-grid">
        <KpiCard
          label="AUDITED PERIODS"
          value={reportsList.length}
          subtitle="All finalized"
          description="Complete historical archives"
          icon={FileCheck}
          tone="safe"
        />
        <KpiCard
          label="AUDIT COMPLIANCE"
          value="98.2%"
          subtitle="BIS 10500"
          description="Regulatory safety standard met"
          icon={ShieldCheck}
          tone="safe"
        />
        <KpiCard
          label="SUBMISSION CYCLE"
          value="Monthly"
          subtitle="Next: 01 Oct"
          description="Submitted to District Jal Samiti"
          icon={Calendar}
          tone="up"
        />
        <KpiCard
          label="AUTHORITY"
          value="SWSM"
          subtitle="Jharkhand"
          description="Drinking Water & Sanitation Dept"
          icon={Building}
          tone="up"
        />
      </section>

      {/* Generator Tool Card */}
      <section className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <h2>Report Generator</h2>
            <p>Compile live telemetry into an auditable regulatory document</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Report Category
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
              style={{ width: '100%', padding: '10px 12px' }}
            >
              <option value="Quality">Water Quality (BIS 10500 Standards)</option>
              <option value="Performance">Station Throughput & Outflow</option>
              <option value="Alerts">Incident & Valve Interventions Log</option>
              <option value="Summary">Executive District Comparison</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Audit Period
            </label>
            <select
              value={reportMonth}
              onChange={e => setReportMonth(e.target.value)}
              style={{ width: '100%', padding: '10px 12px' }}
            >
              <option value="Aug 2026">August 2026 (Full Month)</option>
              <option value="Jul 2026">July 2026 (Full Month)</option>
              <option value="Q2 2026">Q2 2026 (Apr – Jun 2026)</option>
              <option value="YTD 2026">2026 Year-to-Date</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="export-button"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '11px',
                background: '#155e75',
                color: 'white',
                fontWeight: 600,
              }}
            >
              <FileText size={14} />
              <span>{isGenerating ? 'Compiling...' : 'Create Audit Report'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Reports History Table Card */}
      <section className="card table-card">
        <div className="card-header">
          <div>
            <h2>Generated Report Archives</h2>
            <p>Ready for official download and print</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>DOCUMENT TITLE</th>
                <th>TYPE</th>
                <th>PERIOD</th>
                <th>GENERATED AT</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {reportsList.map(rpt => (
                <tr key={rpt.id}>
                  <td><span className="muted-cell">{rpt.id}</span></td>
                  <td><strong>{rpt.title}</strong></td>
                  <td>
                    <span
                      style={{
                        background: '#f1f5f9',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#475569',
                      }}
                    >
                      {rpt.type}
                    </span>
                  </td>
                  <td>{rpt.period}</td>
                  <td className="muted-cell">{rpt.generatedAt}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#18845b', fontSize: '11px', fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      {rpt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDownload(rpt)}
                      className="view-text"
                      style={{ padding: '4px 8px', background: '#f0fdf4', borderRadius: '6px', color: '#16a34a' }}
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
