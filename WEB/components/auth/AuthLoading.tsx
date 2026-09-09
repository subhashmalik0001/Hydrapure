'use client'

import React from 'react'

export function AuthLoading() {
  return (
    <div className="min-h-screen w-full bg-[#0A0D14] flex flex-col items-center justify-center relative overflow-hidden font-sans text-slate-100">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#021BFE]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand & Loading Container */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Logo Shield & Crest */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#021BFE] to-[#0114C7] p-[1px] shadow-xl shadow-[#021BFE]/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#070A12] rounded-[15px] flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[#021BFE]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
        </div>

        {/* Minimal Typography */}
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-tight text-white">HydraPure</h2>
          <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">
            Water Safety Platform
          </p>
        </div>

        {/* High-Precision Loading Indicator */}
        <div className="w-48 h-1 bg-slate-800/80 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#021BFE] via-[#38bdf8] to-[#021BFE] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <p className="text-xs text-slate-500 font-mono">Authenticating secure session...</p>
      </div>
    </div>
  )
}
