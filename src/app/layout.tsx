import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Axiom — Operator Intelligence',
  description: 'AI-native customer intelligence and reactivation for ecommerce operators.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="flex h-screen overflow-hidden font-sans antialiased"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </body>
    </html>
  )
}
