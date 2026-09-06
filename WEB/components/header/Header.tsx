'use client'

import { useState } from 'react'
import { Search, Bell, ChevronDown, X } from 'lucide-react'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)

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
        <div className="profile">
          <div className="avatar">AY</div>
          <div><strong>Alok Yadav</strong><span>Admin</span></div>
          <ChevronDown />
        </div>
      </div>
    </header>
  )
}
