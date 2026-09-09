'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Bell, ChevronDown, X, LogOut, ShieldCheck } from 'lucide-react'
import { useAuthContext } from '@/lib/context/AuthContext'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { user, logout } = useAuthContext()

  const displayName = user?.fullName || 'Alok Yadav'
  const displayEmail = user?.email || 'admin@gmail.com'
  const displayRole = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? 'Admin' : (user?.role || 'Admin')

  // Calculate initials (e.g. Alok Yadav -> AY)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AY'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="topbar">
      <div className="search">
        <Search />
        <input
          aria-label="Search dashboard"
          placeholder="Search stations, districts, parameters..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => onSearchChange('')} aria-label="Clear search">
            <X />
          </button>
        )}
      </div>
      <div className="top-actions">
        <button className="round-button" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell /><i className="notification-dot" />
        </button>

        <div className="relative" ref={menuRef}>
          <div
            className="profile cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="avatar">{initials}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>
            <ChevronDown className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {/* User Profile Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3 p-2 border-b border-slate-100 pb-3 mb-2">
                <div className="avatar !w-9 !h-9">{initials}</div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#101820] truncate">{displayName}</div>
                  <div className="text-[10px] text-[#64748b] truncate">{displayEmail}</div>
                  <div className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#18845b] mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-[#18845b]" />
                    <span>{displayRole} Access</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false)
                  logout()
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#d45252] hover:bg-[#fff0f0] rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
