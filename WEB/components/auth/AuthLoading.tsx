'use client'

import React from 'react'

export function AuthLoading() {
  return (
    <div className="min-h-screen w-full bg-[#edf2f6] flex flex-col items-center justify-center relative overflow-hidden font-sans text-[#101820]">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#155e75]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand & Loading Container */}
      <div className="relative z-10 flex flex-col items-center space-y-4 p-8 bg-white border border-slate-200/90 rounded-[28px] shadow-[0_10px_35px_rgba(31,50,63,0.06)]">
        {/* Logo */}
        <div className="h-10 w-auto flex items-center justify-center">
          <img
            src="/logo.png"
            alt="HydraPure Logo"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Minimal Typography */}
        <div className="text-center">
          <p className="text-[11px] font-mono font-bold text-[#155e75] uppercase tracking-widest">
            Water Safety Platform
          </p>
        </div>

        {/* High-Precision Loading Bar */}
        <div className="w-48 h-1 bg-[#e2e8f0] rounded-full overflow-hidden relative mt-2">
          <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#10190b] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>

        <p className="text-xs text-[#718092] font-mono pt-1">Authenticating telemetry session...</p>
      </div>
    </div>
  )
}
