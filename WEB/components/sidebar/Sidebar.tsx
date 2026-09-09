'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MapPin, Activity, Bell, FileText, Map, Settings,
  CircleHelp, MessageSquare, ChevronDown, Presentation, LogOut,
} from 'lucide-react'
import { useApp } from '@/lib/context/AppContext'
import { useAuthContext } from '@/lib/context/AuthContext'
import type { UserRole } from '@/lib/types'

interface NavEntry {
  icon: React.ElementType
  label: string
  href: string
  roles: UserRole[]
}

const mainNav: NavEntry[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', roles: ['admin', 'operator', 'technician'] },
  { icon: Presentation, label: 'Pitch & Demo', href: '/pitch', roles: ['admin', 'operator', 'technician'] },
  { icon: MapPin, label: 'Water Stations', href: '/stations', roles: ['admin', 'operator', 'technician'] },
  { icon: Activity, label: 'Water Quality', href: '/quality', roles: ['admin', 'operator'] },
  { icon: Bell, label: 'Alerts', href: '/alerts', roles: ['admin', 'operator', 'technician'] },
  { icon: FileText, label: 'Reports', href: '/reports', roles: ['admin'] },
  { icon: Map, label: 'Map', href: '/map', roles: ['admin', 'operator'] },
  { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { role } = useApp()
  const { user, logout } = useAuthContext()

  const displayName = user?.fullName || 'Alok Yadav'
  const displayRole = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'Admin' : (user?.role || 'Admin')

  // Calculate initials (e.g. Alok Yadav -> AY)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AY'

  const filteredNav = mainNav.filter(n => n.roles.includes(role))

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="Hydrapure Logo"
            width={180}
            height={60}
            className="brand-logo"
            priority
          />
        </Link>
      </div>

      <nav className="nav-list">
        {filteredNav.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? 'active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item"><CircleHelp /><span>Help</span></button>
        <button className="nav-item"><MessageSquare /><span>Feedback</span></button>
        <div className="sidebar-profile">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="ml-auto text-[#718092] hover:text-[#d45252] p-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
