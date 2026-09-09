import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account | HydraPure Water Safety Platform',
  description: 'Create your HydraPure account to access the water safety platform.',
}

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your HydraPure account"
      subtitle="Request secure access to the water safety platform."
    >
      <SignupForm />
    </AuthLayout>
  )
}
