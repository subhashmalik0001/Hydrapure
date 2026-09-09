'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/context/AuthContext'
import { PasswordField } from './PasswordField'
import { AuthError } from './AuthError'

const DISTRICTS = [
  'Dhanbad', 'Bokaro', 'Ranchi', 'Jamshedpur', 'Giridih',
  'Hazaribagh', 'Deoghar', 'Dumka', 'Palamu', 'Gumla',
]

function getPasswordRequirements(pw: string) {
  return {
    minLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
  }
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  const reqs = getPasswordRequirements(pw)
  let score = 0
  if (reqs.minLength) score++
  if (reqs.hasUpper) score++
  if (reqs.hasLower) score++
  if (reqs.hasNumber) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' }
  if (score === 2 || score === 3) return { score: 2, label: 'Fair', color: '#f59e0b' }
  return { score: 3, label: 'Strong', color: '#10b981' }
}

export function SignupForm() {
  const router = useRouter()
  const { signup } = useAuthContext()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    district: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const reqs = getPasswordRequirements(form.password)
  const strength = getPasswordStrength(form.password)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.full_name.trim()) {
      setError('Full name is required')
      return
    }
    if (!form.email.trim()) {
      setError('Work email is required')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!reqs.hasUpper || !reqs.hasLower || !reqs.hasNumber) {
      setError('Password does not meet required security criteria')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await signup({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone || undefined,
        district: form.district || undefined,
      })
      setDone(true)
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4 space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Check your email</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            We sent a verification link to <strong className="text-white font-mono">{form.email}</strong>.
            Please verify your email address to activate your account.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left font-mono">
          <span className="text-[#021BFE] font-semibold">Security Note:</span> Your account starts with default <strong className="text-slate-200">Viewer</strong> access. An administrator can elevate your operational role after identity confirmation.
        </div>

        <Link
          href="/login"
          className="inline-block w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm transition-all"
        >
          Return to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="signup-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Full Name *
          </label>
          <input
            id="signup-name"
            type="text"
            className="w-full bg-[#070A12] border border-slate-800 focus:border-[#021BFE] focus:ring-4 focus:ring-[#021BFE]/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200"
            placeholder="Alok Yadav"
            value={form.full_name}
            onChange={set('full_name')}
            autoComplete="name"
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="signup-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Phone Number
          </label>
          <input
            id="signup-phone"
            type="tel"
            className="w-full bg-[#070A12] border border-slate-800 focus:border-[#021BFE] focus:ring-4 focus:ring-[#021BFE]/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200"
            placeholder="+91 94310 XXXXX"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
          Work Email *
        </label>
        <input
          id="signup-email"
          type="email"
          className="w-full bg-[#070A12] border border-slate-800 focus:border-[#021BFE] focus:ring-4 focus:ring-[#021BFE]/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200"
          placeholder="officer@hydrapure.gov.in"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-district" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
          District
        </label>
        <select
          id="signup-district"
          className="w-full bg-[#070A12] border border-slate-800 focus:border-[#021BFE] focus:ring-4 focus:ring-[#021BFE]/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-all duration-200"
          value={form.district}
          onChange={set('district')}
          disabled={loading}
        >
          <option value="">— Select assigned district —</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <PasswordField
          id="signup-password"
          label="Password *"
          value={form.password}
          onChange={set('password') as any}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          disabled={loading}
        />

        {form.password && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex space-x-1">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(strength.score / 3) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <span className="text-xs font-mono font-semibold" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>

            {/* Password requirements indicators */}
            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
              <span className={reqs.minLength ? 'text-emerald-400' : 'text-slate-500'}>
                {reqs.minLength ? '✓' : '○'} Min 8 characters
              </span>
              <span className={reqs.hasUpper ? 'text-emerald-400' : 'text-slate-500'}>
                {reqs.hasUpper ? '✓' : '○'} Uppercase letter
              </span>
              <span className={reqs.hasLower ? 'text-emerald-400' : 'text-slate-500'}>
                {reqs.hasLower ? '✓' : '○'} Lowercase letter
              </span>
              <span className={reqs.hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                {reqs.hasNumber ? '✓' : '○'} Number
              </span>
            </div>
          </div>
        )}
      </div>

      <PasswordField
        id="signup-confirm"
        label="Confirm Password *"
        value={form.confirm}
        onChange={set('confirm') as any}
        placeholder="Repeat password"
        autoComplete="new-password"
        disabled={loading}
      />

      <button
        type="submit"
        id="signup-submit-btn"
        className="w-full bg-[#021BFE] hover:bg-[#0114C7] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-lg shadow-[#021BFE]/25 hover:shadow-[#021BFE]/40 focus:outline-none focus:ring-4 focus:ring-[#021BFE]/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>

      <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-[#021BFE] hover:text-[#38bdf8] font-semibold transition-colors">
          Sign in
        </Link>
      </div>
    </form>
  )
}

export default SignupForm
