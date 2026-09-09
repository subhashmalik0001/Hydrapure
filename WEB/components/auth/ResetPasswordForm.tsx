'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPasswordApi } from '@/lib/auth/auth.service'
import { PasswordField } from './PasswordField'
import { AuthError } from './AuthError'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [accessToken, setAccessToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Extract token from query params or URL hash
    let token = searchParams.get('access_token') || searchParams.get('token')
    if (!token && typeof window !== 'undefined') {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace('#', '?'))
      token = params.get('access_token')
    }
    if (token) {
      setAccessToken(token)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!accessToken) {
      setError('Reset token is missing or invalid. Please request a new reset link.')
      return
    }

    setLoading(true)
    try {
      await resetPasswordApi(accessToken, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Password Reset Complete</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your password was updated successfully. You can now sign in with your new credentials.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm transition-all shadow-lg shadow-[#021BFE]/25"
        >
          Sign In Now
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      <p className="text-sm text-slate-300 leading-relaxed mb-2">
        Enter a new secure password for your HydraPure account.
      </p>

      <PasswordField
        id="reset-password"
        label="New Password *"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        disabled={loading}
      />

      <PasswordField
        id="reset-confirm"
        label="Confirm New Password *"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Repeat new password"
        autoComplete="new-password"
        disabled={loading}
      />

      <button
        type="submit"
        id="reset-submit-btn"
        className="w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-lg shadow-[#021BFE]/25 hover:shadow-[#021BFE]/40 focus:outline-none focus:ring-4 focus:ring-[#021BFE]/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Updating Password...</span>
          </>
        ) : (
          <span>Update Password</span>
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

export default ResetPasswordForm
