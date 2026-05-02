'use client'

// FILE: src/components/layout/Sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoPulse } from '@/components/ui/LogoPulse'

const NAV = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/workflows',
    label: 'Workflows',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="1" y="2" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="10" y="6" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="10" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 4h2.5a1.5 1.5 0 011.5 1.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M6 12h2.5A1.5 1.5 0 0110 10.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/integrations',
    label: 'Integrations',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 4h4M4 6v4M12 6v4M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M2 13L6 8l3 3 5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/calculator',
    label: 'Revenue Gap',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M2 12h2M6 8h2M10 5h2M14 2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M2 14V12M6 14V8M10 14V5M14 14V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Brand Settings',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#070714]">
      <div className="px-3 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-center bg-[#070714]">
        <LogoPulse width={190} variant="sidebar" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? 'bg-white/[0.07] text-white'
                  : 'text-white/40 hover:text-white/75 hover:bg-white/[0.04]'
              }`}
            >
              <span className={active ? 'text-[#00d4ff]' : 'text-current'}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
        <IntegrationDot label="Shopify" connected />
        <IntegrationDot label="Klaviyo" connected />
      </div>
    </aside>
  )
}

function IntegrationDot({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#00e676]' : 'bg-white/20'}`}
        style={connected ? { boxShadow: '0 0 4px #00e676aa' } : undefined}
      />
      <span className="text-[11px] text-white/30">{label}</span>
    </div>
  )
}
