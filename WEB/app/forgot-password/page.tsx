import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | HydraPure Water Safety Platform',
  description: 'Reset your HydraPure account password.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your work email and we'll send you a secure reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
