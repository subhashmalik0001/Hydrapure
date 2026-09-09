'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { forgotPasswordApi } from '@/lib/auth/auth.service'
import { AuthError } from './AuthError'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Work email address is required')
      return
    }

    setLoading(true)
    try {
      await forgotPasswordApi(email.trim().toLowerCase())
      setSent(true)
    } catch (err: any) {
      // Security best practice: Never leak whether email exists
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4 space-y-5">
        <div className="w-14 h-14 bg-[#edf8f2] border border-[#24a56f]/30 rounded-full flex items-center justify-center mx-auto text-[#18845b] shadow-sm">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#101820] tracking-tight">Check your email</h3>
          <p className="text-sm text-[#53616d] mt-2 leading-relaxed">
            If an operational account exists for <strong className="text-[#101820] font-mono">{email}</strong>, you will receive a secure password reset link shortly.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs text-[#64748b] text-left font-mono">
          <span className="text-[#155e75] font-semibold">Tip:</span> Please check your inbox and spam folder. Reset links expire in 60 minutes for security.
        </div>

        <Link
          href="/login"
          className="inline-block w-full bg-[#10190b] hover:bg-[#1e2e17] text-white font-semibold rounded-xl py-3 px-4 text-sm transition-all shadow-sm"
        >
          Return to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      <p className="text-sm text-[#53616d] leading-relaxed">
        Enter your work email address and we&apos;ll send you a secure verification link to reset your password.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#697782] font-mono">
          Work Email
        </label>
        <input
          id="forgot-email"
          type="email"
          className="w-full bg-white border border-[#d5dfe5] focus:border-[#155e75] focus:ring-4 focus:ring-[#155e75]/10 rounded-xl px-4 py-2.5 text-sm text-[#101820] placeholder-[#94a3b8] focus:outline-none transition-all duration-200 shadow-sm"
          placeholder="admin@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        id="forgot-submit-btn"
        className="w-full bg-[#10190b] hover:bg-[#1e2e17] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-md shadow-[#10190b]/15 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#10190b]/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Sending Link...</span>
          </>
        ) : (
          <span>Send Reset Link</span>
        )}
      </button>

      <div className="pt-3 border-t border-slate-100 text-center text-xs text-[#64748b]">
        <Link href="/login" className="text-[#155e75] hover:underline font-bold transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
