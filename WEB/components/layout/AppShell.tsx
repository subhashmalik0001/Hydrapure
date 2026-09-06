'use client'

import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'
import { useApp } from '@/lib/context/AppContext'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { searchQuery, setSearchQuery } = useApp()

  return (
    <main className="app-shell">
      <Sidebar />
      <section className="content">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        {children}
      </section>
    </main>
  )
}
