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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {expired && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-center space-x-2">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Your session has expired. Please sign in again.</span>
        </div>
      )}

      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      {/* Demo Accounts Quick-Fill Panel */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2.5">
        <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center space-x-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Quick Demo Accounts</span>
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Click to Auto-fill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@gmail.com')
              setPassword('123456')
              setError(null)
            }}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-[#021BFE]/20 hover:border-[#021BFE]/50 border border-slate-700/60 text-left transition-all group"
          >
            <div className="font-semibold text-slate-200 group-hover:text-cyan-300">admin@gmail.com</div>
            <div className="text-[10px] text-slate-400">Pass: <span className="text-emerald-400">123456</span> • Super Admin</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('admin@hydrapure.gov.in')
              setPassword('Password123!')
              setError(null)
            }}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-[#021BFE]/20 hover:border-[#021BFE]/50 border border-slate-700/60 text-left transition-all group"
          >
            <div className="font-semibold text-slate-200 group-hover:text-cyan-300">admin@hydrapure.gov.in</div>
            <div className="text-[10px] text-slate-400">Pass: <span className="text-emerald-400">Password123!</span> • Director</div>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
          Work Email
        </label>
        <input
          id="login-email"
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
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-[#021BFE] hover:text-[#38bdf8] font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        id="login-submit-btn"
        className="w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-lg shadow-[#021BFE]/25 hover:shadow-[#021BFE]/40 focus:outline-none focus:ring-4 focus:ring-[#021BFE]/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span>Sign In</span>
        )}
      </button>

      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#021BFE] hover:text-[#38bdf8] font-semibold transition-colors">
          Create an account
        </Link>
      </div>
    </form>
  )
}

export default LoginForm
