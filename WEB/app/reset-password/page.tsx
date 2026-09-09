'use client'

import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter a new password for your HydraPure account."
    >
      <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-slate-500">Loading reset interface...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
