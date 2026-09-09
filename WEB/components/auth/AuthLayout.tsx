'use client'

import React, { type ReactNode } from 'react'
import Image from 'next/image'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#070A12] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#021BFE] selection:text-white">
      {/* ─── LEFT PANEL: HydraPure Brand & Mission ─── */}
      <div className="lg:w-1/2 bg-[#0A0E1A] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle Brand Background Gradient Accent */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#021BFE]/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#021BFE] to-[#0114C7] p-[1px] shadow-lg shadow-[#021BFE]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#070A12] rounded-[11px] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#021BFE]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">HydraPure</span>
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Water Safety Network
            </span>
          </div>
        </div>

        {/* Middle Brand Mission Copy */}
        <div className="relative z-10 my-12 lg:my-auto max-w-md">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#021BFE]/10 border border-[#021BFE]/20 text-[#021BFE] text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#021BFE] animate-pulse" />
            <span>Public Infrastructure Protection</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Clean Water.
            <br />
            <span className="text-[#021BFE]">Stronger Communities.</span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm lg:text-base leading-relaxed">
            Secure access to the HydraPure water safety network.
          </p>

          {/* Operational Cadence Statement */}
          <div className="mt-8 pt-8 border-t border-slate-800/80 flex items-center space-x-3 text-xs font-mono text-slate-400">
            <span>Monitor</span>
            <span>•</span>
            <span>Treat</span>
            <span>•</span>
            <span>Verify</span>
            <span>•</span>
            <span>Supply</span>
            <span>•</span>
            <span>Alert</span>
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} HydraPure Smart Infrastructure. All rights reserved.
        </div>
      </div>

      {/* ─── RIGHT PANEL: Authentication Form Card ─── */}
      <div className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#070A12] overflow-y-auto">
        <div className="my-auto max-w-md w-full mx-auto">
          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
          </div>

          {/* Form Content Container */}
          <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
            {children}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-8 text-center text-xs text-slate-500 font-mono flex items-center justify-center space-x-2">
          <svg className="w-3.5 h-3.5 text-[#021BFE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Protected by HydraPure secure authentication</span>
        </div>
      </div>
    </div>
  )
}
export default AuthLayout
