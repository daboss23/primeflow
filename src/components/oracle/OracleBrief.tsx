'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OracleBriefProps {
  redCount: number
  atRiskRevenue: number
  leakTotal: number
  topLeakLabel: string
  topLeakAmount: number
  topLeakCount: number
  recoverableRevenue: number
  topAtRiskName: string
  topAtRiskState: string
  pendingDrafts: number
}

const STATE_LABELS: Record<string, string> = {
  abandoned_cart:      'Abandoned Cart',
  failed_payment:      'Failed Payment',
  dormant_buyer:       'Dormant Buyer',
  repeat_at_risk:      'VIP at Risk',
  replenishment:       'Replenishment',
  engaged_unconverted: 'Engaged, Not Converted',
}

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

export function OracleBrief({
  redCount, atRiskRevenue, leakTotal,
  topLeakLabel, topLeakAmount, topLeakCount,
  recoverableRevenue, topAtRiskName, topAtRiskState, pendingDrafts,
}: OracleBriefProps) {
  const [active,  setActive]  = useState(0)
  const [glowing, setGlowing] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActive((p: number) => (p + 1) % 3), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setGlowing(active)
    const t = setTimeout(() => setGlowing(null), 2600)
    return () => clearTimeout(t)
  }, [active])

  const signals = [
    {
      type:        'risk',
      label:       'Critical Risk',
      accentColor: '#ff4060',
      priority:    'critical' as const,
      title:       redCount > 0
        ? `${redCount} customer${redCount !== 1 ? 's' : ''} in critical health`
        : 'No critical customers detected',
      body:        redCount > 0
        ? `${fmt(atRiskRevenue)} in combined lifetime value is at immediate risk of permanent loss.`
        : 'Customer health is stable across the platform. No urgent intervention required.',
      nextPlay:    redCount > 0
        ? `Contact ${topAtRiskName || 'top at-risk customer'} first — ${STATE_LABELS[topAtRiskState] ?? topAtRiskState} case with the highest recovery potential.`
        : 'Continue monitoring health scores for early-warning signals.',
      href:        '/customers?band=red',
      cta:         'View critical customers',
    },
    {
      type:        'revenue',
      label:       'Revenue Signal',
      accentColor: '#f59e0b',
      priority:    'high' as const,
      title:       `${fmt(leakTotal)} leaking right now`,
      body:        topLeakLabel
        ? `${topLeakLabel} is the primary leak source — ${fmt(topLeakAmount)} across ${topLeakCount} customer${topLeakCount !== 1 ? 's' : ''}.`
        : 'Multiple revenue leak sources active across the customer base.',
      nextPlay:    `${fmt(recoverableRevenue)} is estimated recoverable this week. The window narrows every day without action.`,
      href:        '/workflows',
      cta:         'Launch recovery',
    },
    {
      type:        'action',
      label:       'Operational',
      accentColor: '#00d4ff',
      priority:    (pendingDrafts > 0 ? 'medium' : 'low') as const,
      title:       pendingDrafts > 0
        ? `${pendingDrafts} draft${pendingDrafts !== 1 ? 's' : ''} awaiting approval`
        : 'All sequences active and running',
      body:        pendingDrafts > 0
        ? 'Pending approvals are stalling outreach. Response rates drop significantly after 4 hours of inactivity.'
        : 'No blocked sequences detected. Oracle is reading the system and monitoring for pattern shifts.',
      nextPlay:    pendingDrafts > 0
        ? 'Review and approve queued drafts to maintain sequence momentum and timing precision.'
        : 'Watch for conversion rate changes in Abandoned Cart Recovery — current rate is below benchmark.',
      href:        '/workflows',
      cta:         pendingDrafts > 0 ? 'Review drafts' : 'View workflows',
    },
  ]

  return (
    <div
      className="mb-6"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      {/* Oracle identity bar */}
      <div className="flex items-center gap-2.5 mb-3">
        {/* Animated core node */}
        <div className="relative w-4 h-4 flex-shrink-0">
          <div className="absolute inset-0 rounded-full oracle-ring-1"
            style={{ border: '1px solid rgba(0,212,255,0.35)' }} />
          <div className="absolute inset-[-3px] rounded-full oracle-ring-2"
            style={{ border: '1px solid rgba(130,60,255,0.22)' }} />
          <div className="absolute inset-[3px] rounded-full"
            style={{ background: 'radial-gradient(circle, #00d4ff 0%, #8b5cf6 100%)' }} />
        </div>

        <span className="text-[10px] font-bold tracking-[0.22em] uppercase"
          style={{ color: 'rgba(0,212,255,0.65)' }}>Oracle</span>
        <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>·</span>
        <span className="text-[10px] tracking-[0.12em] uppercase"
          style={{ color: 'rgba(255,255,255,0.25)' }}>Today's Brief</span>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full pulse-dot"
            style={{ background: '#00e676', boxShadow: '0 0 5px #00e676' }} />
          <span className="text-[9px] tracking-[0.14em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}>Reading system</span>
        </div>
      </div>

      {/* Signal cards */}
      <div className="grid grid-cols-3 gap-3">
        {signals.map((sig, i) => {
          const isActive  = active === i
          const isGlowing = glowing === i

          return (
            <div
              key={sig.type}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-700 ${isGlowing ? 'oracle-card-glow' : ''}`}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${sig.accentColor}0b 0%, rgba(255,255,255,0.01) 70%)`
                  : 'rgba(255,255,255,0.015)',
                border: `1px solid ${isActive ? sig.accentColor + '28' : 'rgba(255,255,255,0.05)'}`,
                transition: 'background 0.7s ease, border-color 0.7s ease',
              }}
              onClick={() => setActive(i)}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full"
                style={{
                  background:  isActive ? sig.accentColor : 'transparent',
                  boxShadow:   isActive ? `0 0 10px ${sig.accentColor}55` : 'none',
                  transition:  'background 0.7s ease, box-shadow 0.7s ease',
                }}
              />

              {/* Priority row */}
              <div className="flex items-center justify-between mb-2.5 pl-3">
                <span className="text-[9px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: sig.accentColor + 'cc' }}>{sig.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full"
                    style={{
                      background: sig.priority === 'critical' ? '#ff4060'
                        : sig.priority === 'high'     ? '#f59e0b'
                        : sig.priority === 'medium'   ? '#00d4ff'
                        : 'rgba(255,255,255,0.2)',
                    }} />
                  <span className="text-[9px] uppercase tracking-[0.1em]"
                    style={{ color: 'rgba(255,255,255,0.22)' }}>{sig.priority}</span>
                </div>
              </div>

              {/* Title */}
              <div className="text-[12px] font-semibold leading-snug mb-1.5 pl-3"
                style={{ color: isActive ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.52)' }}>
                {sig.title}
              </div>

              {/* Body */}
              <div className="text-[11px] leading-relaxed mb-3 pl-3"
                style={{ color: 'rgba(255,255,255,0.36)' }}>
                {sig.body}
              </div>

              {/* Next play */}
              <div className="flex items-start gap-2 pt-2.5 pl-3"
                style={{ borderTop: `1px solid ${sig.accentColor}14` }}>
                <div className="w-3.5 h-3.5 rounded flex items-center justify-center mt-0.5 flex-shrink-0"
                  style={{ background: sig.accentColor + '1c' }}>
                  <svg width="7" height="7" fill="none" viewBox="0 0 8 8">
                    <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke={sig.accentColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] mb-0.5"
                    style={{ color: 'rgba(255,255,255,0.18)' }}>Next play</div>
                  <div className="text-[10px] leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.42)' }}>{sig.nextPlay}</div>
                </div>
              </div>

              {/* CTA on active */}
              {isActive && (
                <Link
                  href={sig.href}
                  className="inline-flex items-center gap-1.5 mt-3 pl-3 text-[10px] font-semibold tracking-[0.05em] hover:opacity-80 transition-opacity oracle-type-in"
                  style={{ color: sig.accentColor }}
                >
                  {sig.cta}
                  <svg width="8" height="8" fill="none" viewBox="0 0 8 8">
                    <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
