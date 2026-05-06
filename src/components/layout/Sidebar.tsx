'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from './logo.png'

const NAV = [
  { href: '/', label: 'Dashboard', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>) },
  { href: '/customers', label: 'Customers', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/workflows', label: 'Workflows', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="1" y="2" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="10" y="6" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="10" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4h2.5a1.5 1.5 0 011.5 1.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 12h2.5A1.5 1.5 0 0110 10.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/integrations', label: 'Integrations', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4h4M4 6v4M12 6v4M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/analytics', label: 'Analytics', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 13L6 8l3 3 5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { href: '/calculator', label: 'Revenue Gap', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 12h2M6 8h2M10 5h2M14 2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2 14V12M6 14V8M10 14V5M14 14V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/settings', label: 'Brand Settings', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
]

function LogoWithPulse() {
  return (
    <div style={{ position: 'relative', width: 190, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes axiom-breathe-outer {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          50%       { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
        @keyframes axiom-breathe-mid {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          50%       { transform: translate(-50%, -50%) scale(1.7); opacity: 0; }
        }
        @keyframes axiom-core-breath {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 6px 3px rgba(180,120,255,0.9), 0 0 14px 6px rgba(0,212,255,0.5); }
          50%       { opacity: 0.5; transform: translate(-50%, -50%) scale(0.7); box-shadow: 0 0 3px 1px rgba(180,120,255,0.4), 0 0 6px 2px rgba(0,212,255,0.2); }
        }
        .axm-pulse-outer {
          position: absolute;
          left: 50%; top: 46%;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(160,80,255,0.65) 0%, rgba(0,212,255,0.3) 55%, transparent 75%);
          animation: axiom-breathe-outer 3.2s ease-in-out infinite;
          pointer-events: none;
          z-index: 2;
        }
        .axm-pulse-mid {
          position: absolute;
          left: 50%; top: 46%;
          width: 11px; height: 11px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(160,80,255,0.6) 60%, transparent 80%);
          animation: axiom-breathe-mid 3.2s ease-in-out infinite 0.35s;
          pointer-events: none;
          z-index: 2;
        }
        .axm-core {
          position: absolute;
          left: 50%; top: 46%;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: white;
          animation: axiom-core-breath 3.2s ease-in-out infinite 0.7s;
          pointer-events: none;
          z-index: 3;
        }
      `}</style>

      <Image
        src={logo}
        alt="AXIOMAI"
        width={190}
        height={64}
        className="object-contain"
        style={{ position: 'relative', zIndex: 1 }}
        priority
      />

      <div className="axm-pulse-outer" />
      <div className="axm-pulse-mid" />
      <div className="axm-core" />
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
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#070714]">
      <div className="px-3 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-center bg-[#070714]">
        <LogoWithPulse />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <button key={href} onClick={() => handleNav(href)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${active ? 'bg-white/[0.07] text-white' : 'text-white/40 hover:text-white/75 hover:bg-white/[0.04]'}`}>
              <span className={active ? 'text-[#00d4ff]' : 'text-current'}>{icon}</span>
              {label}
            </button>
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
      <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#00e676]' : 'bg-white/20'}`} style={connected ? { boxShadow: '0 0 4px #00e676aa' } : undefined}/>
      <span className="text-[11px] text-white/30">{label}</span>
    </div>
  )
}
