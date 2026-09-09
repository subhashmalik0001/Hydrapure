'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { resendVerificationApi } from '@/lib/auth/auth.service'
import { AuthError } from '@/components/auth/AuthError'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    if (!email) {
      setError('No email address found. Please try signing in again.')
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await resendVerificationApi(email)
      setMessage(res.message || 'Verification email resent successfully.')
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center py-4 space-y-6">
      <div className="w-16 h-16 bg-[#021BFE]/10 border border-[#021BFE]/20 rounded-full flex items-center justify-center mx-auto text-[#021BFE]">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Verify Your Email Address</h3>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          We sent a verification link to {email ? <strong className="text-white font-mono">{email}</strong> : 'your email address'}.
          Please click the link in your email to verify your identity.
        </p>
      </div>

      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          {message}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm transition-all shadow-lg shadow-[#021BFE]/25 disabled:opacity-50"
        >
          {loading ? 'Resending Link...' : 'Resend Verification Email'}
        </button>

        <Link
          href="/login"
          className="block w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors pt-2 font-mono"
        >
          ← Return to Sign In
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Check your email"
      subtitle="Complete email verification to access the platform."
    >
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-500">Loading verification details...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  )
}
