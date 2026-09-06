'use client'

import { useApp } from '@/lib/context/AppContext'
import type { UserRole } from '@/lib/types'

export function useAuth() {
  const { role, setRole } = useApp()

  const isRole = (targetRole: UserRole) => role === targetRole
  const hasAccess = (allowedRoles: UserRole[]) => allowedRoles.includes(role)

  return {
    role,
    setRole,
    isAdmin: isRole('admin'),
    isOperator: isRole('operator'),
    isTechnician: isRole('technician'),
    hasAccess,
  }
}
