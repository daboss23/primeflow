'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

type NavItem = { href: string; label: string; icon: React.ReactNode }

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const

const NAV: NavItem[] = [
  { href: '/',             label: 'Dashboard',     icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.4"/></svg>) },
  { href: '/customers',    label: 'Customers',     icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><circle cx="8" cy="5.5" r="2.7"/><path d="M2.5 14c0-2.9 2.5-4.6 5.5-4.6S13.5 11.1 13.5 14"/></svg>) },
  { href: '/workflows',    label: 'Workflows',     icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><rect x="1.5" y="2" width="4.5" height="3.5" rx="1"/><rect x="10" y="6.25" width="4.5" height="3.5" rx="1"/><rect x="1.5" y="10.5" width="4.5" height="3.5" rx="1"/><path d="M6 3.75h2.5a1.5 1.5 0 0 1 1.5 1.5V6"/><path d="M6 12.25h2.5a1.5 1.5 0 0 0 1.5-1.5V10"/></svg>) },
  { href: '/integrations', label: 'Integrations',  icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><circle cx="4" cy="4" r="1.8"/><circle cx="12" cy="4" r="1.8"/><circle cx="4" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><path d="M5.8 4h4.4M4 5.8v4.4M12 5.8v4.4M5.8 12h4.4"/></svg>) },
  { href: '/analytics',    label: 'Analytics',     icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><path d="M2 13l4-5 3 3 5-7"/><path d="M11 4h3v3"/></svg>) },
  { href: '/calculator',   label: 'Revenue Gap',   icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><path d="M2 14V11M6 14V8M10 14V5M14 14V2"/></svg>) },
  { href: '/oracle',       label: 'Oracle',        icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><circle cx="8" cy="8" r="5.8"/><circle cx="8" cy="8" r="1.8"/><path d="M8 2.2v1.2M8 12.6v1.2M2.2 8h1.2M12.6 8h1.2"/></svg>) },
  { href: '/settings',     label: 'Brand Vault',   icon: (<svg width="15" height="15" viewBox="0 0 16 16" {...stroke}><path d="M8 2L3 4v4c0 3 2.2 5.5 5 6.2 2.8-.7 5-3.2 5-6.2V4l-5-2z"/></svg>) },
]

function AxiomLogo() {
  return (
    <div className="axiom-logo-wrap">
      <style>{`
        .axiom-logo-wrap {
          position: relative;
          width: 168px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .axiom-logo-wrap::before {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 70px; height: 70px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(120,60,255,0.14) 0%, transparent 70%);
          animation: ax-pulse-outer 4s ease-in-out infinite;
          pointer-events: none;
        }
        .axiom-logo-wrap::after {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 38px; height: 38px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.20) 0%, transparent 70%);
          animation: ax-pulse-inner 4s ease-in-out infinite 0.4s;
          pointer-events: none;
        }
        .axiom-logo-img {
          position: relative;
          z-index: 5;
          mix-blend-mode: lighten;
          filter: drop-shadow(0 0 6px rgba(0,212,255,0.30));
        }
        @keyframes ax-pulse-outer {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
          50%      { transform: translate(-50%,-50%) scale(1.9); opacity: 0; }
        }
        @keyframes ax-pulse-inner {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          50%      { transform: translate(-50%,-50%) scale(1.7); opacity: 0; }
        }
      `}</style>
      <Image
        src="/axiom-logo.png"
        alt="AXIOM"
        width={168}
        height={72}
        className="axiom-logo-img"
        priority
        style={{ width: '168px', height: 'auto', objectFit: 'contain' }}
      />
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleNav(href: string) {
    if (href === '/customers') window.dispatchEvent(new Event('customers:reset'))
    router.push(href)
  }

  return (
    <aside
      className="w-[232px] flex-shrink-0 flex flex-col"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div
        className="px-4 pt-5 pb-4 flex items-center justify-center"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <AxiomLogo />
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <div className="eyebrow" style={{ fontSize: 10, opacity: 0.65 }}>Operations</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className={`
                w-full flex items-center gap-3 px-3 h-9 rounded-[10px]
                text-[13px] font-medium text-left transition-all relative
                ${active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/92 hover:bg-[rgba(255,255,255,0.042)]'
                }
              `}
              style={
                active
                  ? {
                      background: 'rgba(0,212,255,0.075)',
                      boxShadow: '0 0 0 1px rgba(0,212,255,0.20) inset',
                    }
                  : undefined
              }
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{
                    width: 2,
                    height: 18,
                    background: 'linear-gradient(180deg,#00d4ff,#a78bfa)',
                    boxShadow: '0 0 8px rgba(0,212,255,0.65)',
                  }}
                />
              )}
              <span style={{ color: active ? '#00d4ff' : 'currentColor' }}>{icon}</span>
              <span className="tracking-[0.005em]">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer status */}
      <div
        className="px-5 py-4 space-y-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="eyebrow" style={{ fontSize: 10, opacity: 0.65 }}>Integrations</div>
        <IntegrationDot label="Shopify" connected />
        <IntegrationDot label="Klaviyo" connected />
      </div>
    </aside>
  )
}

function IntegrationDot({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-1.5 h-1.5 rounded-full pulse-dot"
        style={{
          background: connected ? '#3ddc97' : 'rgba(255,255,255,0.20)',
          boxShadow: connected ? '0 0 6px rgba(61,220,151,0.7)' : undefined,
        }}
      />
      <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.62)' }}>
        {label}
      </span>
      <span className="ml-auto text-[10.5px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
        {connected ? 'Live' : 'Off'}
      </span>
    </div>
  )
}
