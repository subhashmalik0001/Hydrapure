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
      <div className="text-center py-4 space-y-6">
        <div className="w-16 h-16 bg-[#021BFE]/10 border border-[#021BFE]/20 rounded-full flex items-center justify-center mx-auto text-[#021BFE]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Check your email</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            If an account exists for <strong className="text-white font-mono">{email}</strong>, you will receive a secure password reset link shortly.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left font-mono">
          <span className="text-[#021BFE] font-semibold">Tip:</span> Please check your inbox and spam folder. Reset links expire in 60 minutes for security.
        </div>

        <Link
          href="/login"
          className="inline-block w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm transition-all shadow-lg shadow-[#021BFE]/25"
        >
          Return to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      <p className="text-sm text-slate-300 leading-relaxed">
        Enter your work email address and we&apos;ll send you a secure reset link.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
          Work Email
        </label>
        <input
          id="forgot-email"
          type="email"
          className="w-full bg-[#070A12] border border-slate-800 focus:border-[#021BFE] focus:ring-4 focus:ring-[#021BFE]/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200"
          placeholder="officer@hydrapure.gov.in"
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
        className="w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-lg shadow-[#021BFE]/25 hover:shadow-[#021BFE]/40 focus:outline-none focus:ring-4 focus:ring-[#021BFE]/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <Link href="/login" className="text-[#021BFE] hover:text-[#38bdf8] font-semibold transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
