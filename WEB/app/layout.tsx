import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/context/AppContext'
import AppShell from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Hydrapure | Smart Water Monitoring & Purification Platform',
  description: 'Production-grade water purification and IoT quality monitoring across Jharkhand.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#edf2f6',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[#edf2f6]">
      <body className="antialiased">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  )
}

