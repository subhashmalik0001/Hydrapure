'use client'

import React, { type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#edf2f6] text-[#101820] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#155e75] selection:text-white">
      {/* Central Split Container */}
      <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-[28px] shadow-[0_10px_35px_rgba(31,50,63,0.06)] overflow-hidden flex flex-col lg:flex-row">
        {/* ─── LEFT HERO PANEL: HydraPure Brand & Live Network ─── */}
        <div className="lg:w-1/2 bg-[#fbfcfd] border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Accent */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#155e75]/5 rounded-full blur-[90px] pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center space-x-2 transition-transform hover:scale-[1.01]">
              <Image
                src="/logo.png"
                alt="HydraPure Logo"
                width={185}
                height={55}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#eaf7f0] text-[#18845b]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#24a56f] animate-pulse" />
                Network Online
              </span>
              <span className="text-[11px] font-medium text-[#718092]">
                Jharkhand State Water Grid
              </span>
            </div>
          </div>

          {/* Middle Brand Statement */}
          <div className="relative z-10 my-8 lg:my-auto max-w-md">
            <div className="text-[#155e75] font-bold text-[11px] uppercase tracking-widest font-mono mb-2">
              Continuous Telemetry & Purification
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101820] tracking-tight leading-tight">
              Smart Water Monitoring & Automated Fail-Safe
            </h1>
            <p className="mt-3 text-sm text-[#53616d] leading-relaxed">
              Enterprise IoT command portal for real-time water quality parameters, automated solenoid shut-off actuation, and compliance reporting.
            </p>

            {/* Live Metrics Strip (Matching Dashboard KPI cards) */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200/80">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-sm">
                <span className="text-[10px] font-bold text-[#697782] uppercase tracking-wider block">Real-time Nodes</span>
                <span className="text-xl font-extrabold text-[#101820] tracking-tight mt-0.5 block">10+ Active</span>
                <span className="text-[10px] text-[#18845b] font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#18845b]" /> 100% fail-safe active
                </span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-sm">
                <span className="text-[10px] font-bold text-[#697782] uppercase tracking-wider block">Standard</span>
                <span className="text-xl font-extrabold text-[#101820] tracking-tight mt-0.5 block">BIS 10500</span>
                <span className="text-[10px] text-[#155e75] font-medium block mt-0.5">Automated safety index</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#8b969e] pt-6 border-t border-slate-200/70 font-mono">
            <span>© 2026 HydraPure Grid</span>
            <span className="text-[11px] text-[#53616d]">Secure REST & WS Gateway</span>
          </div>
        </div>

        {/* ─── RIGHT FORM PANEL: Authentication Card ─── */}
        <div className="lg:w-1/2 p-7 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div className="max-w-md w-full mx-auto my-auto">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#101820]">{title}</h2>
              {subtitle && <p className="text-[#64748b] text-sm mt-1.5">{subtitle}</p>}
            </div>

            {/* Form Content */}
            <div className="w-full">
              {children}
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-[#94a3b8] flex items-center justify-center space-x-2">
            <svg className="w-3.5 h-3.5 text-[#18845b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Authorized Public Water Infrastructure Access</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
