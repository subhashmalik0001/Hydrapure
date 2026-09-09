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
      <div className="text-center py-4 space-y-5">
        <div className="w-14 h-14 bg-[#edf8f2] border border-[#24a56f]/30 rounded-full flex items-center justify-center mx-auto text-[#18845b] shadow-sm">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#101820] tracking-tight">Check your email</h3>
          <p className="text-sm text-[#53616d] mt-2 leading-relaxed">
            We sent an activation link to <strong className="text-[#101820] font-mono">{form.email}</strong>.
            Please verify your work email address to activate your telemetry access.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-xs text-[#64748b] text-left font-mono">
          <span className="text-[#155e75] font-semibold">Security Note:</span> Your account starts with default <strong className="text-[#101820]">Viewer</strong> access. An administrator will elevate your operational scope after verification.
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
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
      {error && <AuthError message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="signup-name" className="block text-[11px] font-bold uppercase tracking-wider text-[#697782] font-mono">
            Full Name *
          </label>
          <input
            id="signup-name"
            type="text"
            className="w-full bg-white border border-[#d5dfe5] focus:border-[#155e75] focus:ring-4 focus:ring-[#155e75]/10 rounded-xl px-3.5 py-2 text-sm text-[#101820] placeholder-[#94a3b8] focus:outline-none transition-all duration-200 shadow-sm"
            placeholder="Alok Yadav"
            value={form.full_name}
            onChange={set('full_name')}
            autoComplete="name"
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="signup-phone" className="block text-[11px] font-bold uppercase tracking-wider text-[#697782] font-mono">
            Phone Number
          </label>
          <input
            id="signup-phone"
            type="tel"
            className="w-full bg-white border border-[#d5dfe5] focus:border-[#155e75] focus:ring-4 focus:ring-[#155e75]/10 rounded-xl px-3.5 py-2 text-sm text-[#101820] placeholder-[#94a3b8] focus:outline-none transition-all duration-200 shadow-sm"
            placeholder="+91 94310 XXXXX"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="signup-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#697782] font-mono">
          Work Email *
        </label>
        <input
          id="signup-email"
          type="email"
          className="w-full bg-white border border-[#d5dfe5] focus:border-[#155e75] focus:ring-4 focus:ring-[#155e75]/10 rounded-xl px-3.5 py-2 text-sm text-[#101820] placeholder-[#94a3b8] focus:outline-none transition-all duration-200 shadow-sm"
          placeholder="alok.yadav@hydrapure.gov.in"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="signup-district" className="block text-[11px] font-bold uppercase tracking-wider text-[#697782] font-mono">
          Assigned District
        </label>
        <select
          id="signup-district"
          className="w-full bg-white border border-[#d5dfe5] focus:border-[#155e75] focus:ring-4 focus:ring-[#155e75]/10 rounded-xl px-3.5 py-2 text-sm text-[#101820] focus:outline-none transition-all duration-200 shadow-sm"
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

      <div className="space-y-1">
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
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden flex space-x-1">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(strength.score / 3) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono font-semibold" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>

            {/* Password requirements indicators */}
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[#718092]">
              <span className={reqs.minLength ? 'text-[#18845b] font-bold' : 'text-[#94a3b8]'}>
                {reqs.minLength ? '✓' : '○'} Min 8 characters
              </span>
              <span className={reqs.hasUpper ? 'text-[#18845b] font-bold' : 'text-[#94a3b8]'}>
                {reqs.hasUpper ? '✓' : '○'} Uppercase letter
              </span>
              <span className={reqs.hasLower ? 'text-[#18845b] font-bold' : 'text-[#94a3b8]'}>
                {reqs.hasLower ? '✓' : '○'} Lowercase letter
              </span>
              <span className={reqs.hasNumber ? 'text-[#18845b] font-bold' : 'text-[#94a3b8]'}>
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
        className="w-full bg-[#10190b] hover:bg-[#1e2e17] text-white font-semibold rounded-xl py-3 px-4 text-sm shadow-md shadow-[#10190b]/15 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#10190b]/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3 cursor-pointer"
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
          <span>Register Account</span>
        )}
      </button>

      <div className="pt-3 border-t border-slate-100 text-center text-xs text-[#64748b]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#155e75] hover:underline font-bold transition-colors">
          Sign in
        </Link>
      </div>
    </form>
  )
}

export default SignupForm
