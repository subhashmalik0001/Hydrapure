'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { PasswordField } from './PasswordField'
import { AuthError } from './AuthError'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthContext()

  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = searchParams.get('from') || '/'
  const expired = searchParams.get('expired') === '1'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Work email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
      router.push(from)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Email or password is incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {expired && (
        <div className="p-3.5 rounded-xl bg-[#fff7e8] border border-[#fde68a] text-[#c48216] text-xs font-mono flex items-center space-x-2">
          <svg className="w-4 h-4 text-[#c48216] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Your session has expired. Please sign in again.</span>
        </div>
      )}

      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      {/* Demo Accounts Quick-Fill Panel (Matching Dashboard Cards) */}
      <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-200/90 text-xs text-[#53616d] space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#697782] uppercase tracking-wider">
          <span className="flex items-center space-x-1.5 text-[#155e75]">
            <span className="w-2 h-2 rounded-full bg-[#18845b] animate-pulse"></span>
            <span>Quick Demo Accounts</span>
          </span>
          <span className="text-[10px] text-[#94a3b8] font-sans">Click to Auto-fill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@gmail.com')
              setPassword('123456')
              setError(null)
            }}
            className="p-2.5 rounded-xl bg-white hover:bg-[#edf8f2] hover:border-[#24a56f]/40 border border-slate-200 shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="font-bold text-[#101820] group-hover:text-[#18845b] flex items-center justify-between">
              <span>Alok Yadav (AY)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#edf8f2] text-[#18845b] font-semibold">Admin</span>
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5">admin@gmail.com</div>
            <div className="text-[10px] text-[#94a3b8]">Pass: <strong className="text-[#18845b]">123456</strong></div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('admin@hydrapure.gov.in')
              setPassword('Password123!')
              setError(null)
            }}
            className="p-2.5 rounded-xl bg-white hover:bg-[#f0f4f6] hover:border-[#155e75]/40 border border-slate-200 shadow-sm text-left transition-all group cursor-pointer"
          >
            <div className="font-bold text-[#101820] group-hover:text-[#155e75] flex items-center justify-between">
              <span>State Director</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0f4f6] text-[#155e75] font-semibold">Super</span>
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5 truncate">admin@hydrapure.gov.in</div>
            <div className="text-[10px] text-[#94a3b8]">Pass: <strong className="text-[#155e75]">Password123!</strong></div>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#697782] font-mono">
          Work Email
        </label>
        <input
          id="login-email"
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

      <div className="space-y-1.5">
        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={loading}
        />
        <div className="flex justify-end pt-0.5">
          <Link
            href="/forgot-password"
            className="text-xs text-[#155e75] hover:text-[#0e3b4a] font-semibold transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        id="login-submit-btn"
        className="w-full bg-[#10190b] hover:bg-[#1e2e17] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-md shadow-[#10190b]/15 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#10190b]/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In to Dashboard</span>
        )}
      </button>

      <div className="pt-3 border-t border-slate-100 text-center text-xs text-[#64748b]">
        Don&apos;t have an operational account?{' '}
        <Link href="/signup" className="text-[#155e75] hover:underline font-bold transition-colors">
          Create an account
        </Link>
      </div>
    </form>
  )
}

export default LoginForm
