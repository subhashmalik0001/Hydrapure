'use client'

import React from 'react'

interface AuthErrorProps {
  message?: string | null
  code?: string
  onDismiss?: () => void
}

export function mapAuthErrorMessage(rawMessage?: string | null, code?: string): string {
  if (!rawMessage && !code) return 'An unexpected error occurred. Please try again.'

  const text = (rawMessage || code || '').toLowerCase()

  if (text.includes('invalid') || text.includes('credential') || text.includes('password') || code === 'INVALID_CREDENTIALS') {
    return 'Email or password is incorrect.'
  }
  if (text.includes('inactive') || text.includes('disabled') || text.includes('deactivated') || code === 'ACCOUNT_DISABLED') {
    return 'Your account is currently inactive. Contact an administrator.'
  }
  if (text.includes('verify') || text.includes('unverified') || code === 'EMAIL_NOT_VERIFIED') {
    return 'Please verify your email before signing in.'
  }
  if (text.includes('rate') || text.includes('attempts') || text.includes('too many') || code === 'RATE_LIMITED') {
    return 'Too many login attempts. Please wait a few moments and try again.'
  }
  if (text.includes('network') || text.includes('connect') || text.includes('failed to fetch') || code === 'NETWORK_ERROR') {
    return 'Unable to connect right now. Please check your network connection.'
  }

  return rawMessage || 'Authentication failed. Please check your credentials.'
}

export function AuthError({ message, code, onDismiss }: AuthErrorProps) {
  if (!message && !code) return null

  const displayMessage = mapAuthErrorMessage(message, code)

  return (
    <div className="p-3.5 rounded-xl bg-[#fff0f0] border border-[#fbd5d5] text-[#d45252] text-xs flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
      <div className="flex items-start gap-2.5">
        <svg
          className="w-4 h-4 text-[#d45252] shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-medium text-[#b93838] leading-relaxed">{displayMessage}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#d45252] hover:text-[#991b1b] transition-colors p-0.5 rounded"
          aria-label="Dismiss error"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
