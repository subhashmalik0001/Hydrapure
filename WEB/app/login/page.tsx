import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | HydraPure Water Safety Platform',
  description: 'Sign in to access your HydraPure water safety operations dashboard.',
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Access your water safety operations dashboard."
    >
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-500">Loading authentication interface...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
