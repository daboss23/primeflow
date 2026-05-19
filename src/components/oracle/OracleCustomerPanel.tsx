'use client'

import Link from 'next/link'

const STATE_LABELS: Record<string, string> = {
  abandoned_cart:      'Abandoned Cart',
  failed_payment:      'Failed Payment',
  dormant_buyer:       'Dormant Buyer',
  repeat_at_risk:      'VIP at Risk',
  replenishment:       'Replenishment',
  engaged_unconverted: 'Engaged, Not Converted',
}

interface OracleCustomerPanelProps {
  criticalCount:       number
  watchCount:          number
  topOpportunityName:  string | null
  topOpportunityState: string | null
  topOpportunityScore: number | null
  totalCustomers:      number
}

export function OracleCustomerPanel({
  criticalCount, watchCount, topOpportunityName,
  topOpportunityState, topOpportunityScore, totalCustomers,
}: OracleCustomerPanelProps) {
  if (totalCustomers === 0) return null

  const signals = [
    {
      accentColor: '#ff4060',
      label:       'Critical',
      title:       criticalCount > 0
        ? `${criticalCount} customer${criticalCount !== 1 ? 's' : ''} require immediate intervention`
        : 'No critical customers detected',
      body:        criticalCount > 0
        ? `These customers have the lowest health scores and the highest churn probability. Act before the window closes.`
        : 'All customers are currently within acceptable health thresholds.',
      nextPlay:    criticalCount > 0
        ? 'Filter by Critical and work top-to-bottom by opportunity score.'
        : 'Continue monitoring for early health drops.',
      href:        '/customers?band=red',
      cta:         'View critical',
    },
    {
      accentColor: '#f59e0b',
      label:       'Save Opportunity',
      title:       topOpportunityName
        ? `${topOpportunityName} is your highest save opportunity`
        : 'No high-opportunity customers flagged',
      body:        topOpportunityName
        ? `${STATE_LABELS[topOpportunityState ?? ''] ?? topOpportunityState ?? 'At-risk'} — opportunity score ${topOpportunityScore ?? '—'}. High recovery probability with targeted outreach.`
        : 'Oracle is monitoring the full customer set for emerging opportunities.',
      nextPlay:    topOpportunityName
        ? `Open ${topOpportunityName}'s profile and generate a personalised recovery draft.`
        : 'Watch for customers whose opportunity score rises above 70.',
      href:        '/customers?band=red',
      cta:         'Open profile',
    },
    {
      accentColor: '#a78bfa',
      label:       'Watchlist',
      title:       watchCount > 0
        ? `${watchCount} customer${watchCount !== 1 ? 's' : ''} on watchlist — health declining`
        : 'Watchlist is clear',
      body:        watchCount > 0
        ? `These customers have moved into yellow health. Left unaddressed, they will migrate to critical within 14–21 days.`
        : 'No customers are currently in the declining health band.',
      nextPlay:    watchCount > 0
        ? 'Prioritise the watchlist before it becomes a critical intervention queue.'
        : 'System health is balanced. No immediate watchlist action needed.',
      href:        '/customers?band=yellow',
      cta:         'View watchlist',
    },
  ]

  return (
    <div
      className="mb-5 rounded-xl overflow-hidden oracle-signal-in"
      style={{ border: '1px solid rgba(0,212,255,0.1)', background: 'linear-gradient(135deg, rgba(0,212,255,0.02) 0%, rgba(130,60,255,0.01) 100%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}
      >
        <div className="relative w-3.5 h-3.5 flex-shrink-0">
          <div className="absolute inset-0 rounded-full oracle-ring-1"
            style={{ border: '1px solid rgba(0,212,255,0.45)' }} />
          <div className="absolute inset-[2.5px] rounded-full"
            style={{ background: 'radial-gradient(circle, #00d4ff 0%, #8b5cf6 100%)' }} />
        </div>
        <span className="text-[9px] font-bold tracking-[0.24em] uppercase"
          style={{ color: 'rgba(0,212,255,0.6)' }}>Oracle · Customer Intelligence</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full pulse-dot"
            style={{ background: '#00e676', boxShadow: '0 0 4px #00e676' }} />
          <span className="text-[9px] tracking-[0.1em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            {criticalCount + watchCount} customers flagged
          </span>
        </div>
      </div>

      {/* Signals */}
      <div className="grid grid-cols-3">
        {signals.map((sig, i) => (
          <div
            key={sig.label}
            className="px-4 py-3.5"
            style={{ borderRight: i < signals.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: sig.accentColor, boxShadow: `0 0 5px ${sig.accentColor}88` }} />
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase"
                style={{ color: sig.accentColor + 'cc' }}>{sig.label}</span>
            </div>
            <div className="text-[11px] font-semibold leading-snug mb-1.5"
              style={{ color: 'rgba(255,255,255,0.75)' }}>{sig.title}</div>
            <div className="text-[10px] leading-relaxed mb-2.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}>{sig.body}</div>
            <div className="flex items-start gap-1.5">
              <svg width="8" height="8" fill="none" viewBox="0 0 8 8" className="mt-0.5 flex-shrink-0">
                <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke={sig.accentColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px]" style={{ color: sig.accentColor + 'cc' }}>{sig.nextPlay}</span>
            </div>
            <Link
              href={sig.href}
              className="inline-flex items-center gap-1 mt-2.5 text-[9px] font-semibold tracking-[0.08em] hover:opacity-75 transition-opacity"
              style={{ color: sig.accentColor }}
            >
              {sig.cta}
              <svg width="7" height="7" fill="none" viewBox="0 0 8 8">
                <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
