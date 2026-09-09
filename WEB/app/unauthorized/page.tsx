'use client'

import React from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function UnauthorizedPage() {
  return (
    <AuthLayout
      title="403 — Unauthorized Access"
      subtitle="Your role does not have permission to view this resource."
    >
      <div className="text-center py-4 space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Access Restricted</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your current assigned role does not grant authorization to access this administrative feature or regional scope.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left font-mono">
          <span className="text-amber-400 font-semibold">Contact Admin:</span> If you believe you should have access to this station or feature, please contact your HydraPure District Administrator.
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href="/"
            className="block w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm transition-all shadow-lg shadow-[#021BFE]/25"
          >
            Return to Operational Dashboard
          </Link>

          <Link
            href="/login"
            className="block w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors pt-2 font-mono"
          >
            Sign in with a different account
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
