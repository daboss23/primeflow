'use client'

import React from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

const NAV: { href: string; label: string; icon: React.ReactElement }[] = [
  { href: '/', label: 'Dashboard', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>) },
  { href: '/customers', label: 'Customers', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/workflows', label: 'Workflows', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="1" y="2" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="10" y="6" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="10" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4h2.5a1.5 1.5 0 011.5 1.5V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 12h2.5A1.5 1.5 0 0110 10.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/integrations', label: 'Integrations', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4h4M4 6v4M12 6v4M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/analytics', label: 'Analytics', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 13L6 8l3 3 5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { href: '/calculator', label: 'Revenue Gap', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 12h2M6 8h2M10 5h2M14 2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2 14V12M6 14V8M10 14V5M14 14V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { href: '/settings', label: 'Brand Settings', icon: (<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>) },
]

function AxiomaiLogo() {
  return (
    <div className="axiomai-logo-wrapper">
      <style>{`
        .axiomai-logo-wrapper {
          position: relative;
          width: 200px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .axiomai-logo-wrapper::before {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(130,60,255,0.18) 0%, transparent 70%);
          animation: axiomPulseOuter 3s ease-in-out infinite;
          pointer-events: none;
        }
        .axiomai-logo-wrapper::after {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 44px; height: 44px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.22) 0%, rgba(130,60,255,0.12) 50%, transparent 70%);
          animation: axiomPulseMid 3s ease-in-out infinite 0.4s;
          pointer-events: none;
        }
        .axiomai-img {
          position: relative;
          z-index: 5;
          mix-blend-mode: lighten;
          animation: axiomLogoGlow 3s ease-in-out infinite;
        }
        @keyframes axiomPulseOuter {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
          50%      { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        @keyframes axiomPulseMid {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          50%      { transform: translate(-50%,-50%) scale(2.0); opacity: 0; }
        }
        @keyframes axiomLogoGlow {
          0%,100% { filter: drop-shadow(0 0 5px rgba(0,212,255,0.35)) drop-shadow(0 0 12px rgba(130,60,255,0.2)); }
          50%      { filter: drop-shadow(0 0 12px rgba(0,212,255,0.65)) drop-shadow(0 0 24px rgba(130,60,255,0.45)); }
        }
      `}</style>
      <Image
        src="/axiom-logo.png"
        alt="AXIOM AI"
        width={200}
        height={90}
        className="axiomai-img"
        priority
        style={{ width: '200px', height: 'auto', objectFit: 'contain' }}
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
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#070714]">
      <div className="px-3 pt-4 pb-4 border-b border-white/[0.06] flex items-center justify-center bg-[#070714]">
        <AxiomaiLogo />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <button key={href} onClick={() => handleNav(href)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${active ? 'bg-white/[0.07] text-white' : 'text-white/40 hover:text-white/75 hover:bg-white/[0.04]'}`}>
              <span className={active ? 'text-[#00d4ff]' : 'text-current'}>{icon}</span>
              <span className="flex-1">{label}</span>
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
