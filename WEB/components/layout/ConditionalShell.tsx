'use client'

import { usePathname } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useAuthContext } from '@/lib/context/AuthContext'

// These routes render WITHOUT the sidebar/header
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/unauthorized']

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isAuthPage) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}
