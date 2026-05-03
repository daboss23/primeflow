'use client'

// FILE: src/components/customers/CustomerDetail.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerWithHealth } from '@/types'
import { fullName, initials, formatCurrency, daysSinceLabel, bandColor } from '@/lib/utils'

export function CustomerDetail({
  customer,
  onRefresh,
}: {
  customer: CustomerWithHealth
  onRefresh: () => void
}) {
  const router = useRouter()
  const [launching, setLaunching] = useState(false)
  const [launched,  setLaunched]  = useState(false)

  const name   = fullName(customer.first_name, customer.last_name)
  const ini    = initials(customer.first_name, customer.last_name)
  const hColor = bandColor(customer.health_band)

  const HEALTH_LABELS: Record<string, string> = {
    red: 'Critical', yellow: 'Watch', green: 'Good',
  }
  const HEALTH_BG: Record<string, string> = {
    red:    'linear-gradient(135deg,#8b1a2e,#c0253a)',
    yellow: 'linear-gradient(135deg,#78450a,#b8690f)',
    green:  'linear-gradient(135deg,#0d3320,#0e5c35)',
  }
  const STATE_COLORS: Record<string, string> = {
    abandoned_cart: '#ff4d4d', failed_payment: '#ff8c00',
    dormant_buyer: '#a78bfa', repeat_at_risk: '#f59e0b',
    replenishment: '#00d4ff', engaged_unconverted: '#8b5cf6',
  }
  const STATE_LABELS: Record<string, string> = {
    abandoned_cart: 'Abandoned Cart', failed_payment: 'Failed Payment',
    dormant_buyer: 'Dormant Buyer', repeat_at_risk: 'VIP At Risk',
    replenishment: 'Replenishment', engaged_unconverted: 'Engaged, Not Converted',
  }
  const WORKFLOW_CFG: Record<string, { label: string; description: string; color: string; icon: string; steps: string; action: string }> = {
    abandoned_cart:      { label: 'Cart Recovery',      description: 'Multi-step Email + SMS cart recovery sequence',     color: '#ff4d4d', icon: '🛒', steps: '4-step · Email + SMS', action: 'Launch Cart Recovery' },
    failed_payment:      { label: 'Payment Recovery',   description: 'Immediate payment recovery outreach via Email',     color: '#ff8c00', icon: '💳', steps: '3-step · Email',        action: 'Launch Payment Recovery' },
    dormant_buyer:       { label: 'Win-Back Sequence',  description: 'Warm win-back with exclusive comeback offer',       color: '#a78bfa', icon: '💤', steps: '4-step · Email + SMS', action: 'Launch Win-Back' },
    repeat_at_risk:      { label: 'VIP Retention',      description: 'Premium personal outreach for high-value customer', color: '#f59e0b', icon: '⭐', steps: '3-step · Email + SMS', action: 'Launch VIP Retention' },
    replenishment:       { label: 'Replenishment Flow', description: 'Predictive replenishment nudge via SMS',            color: '#00d4ff', icon: '🔄', steps: '2-step · SMS',          action: 'Launch Replenishment' },
    engaged_unconverted: { label: 'Conversion Flow',    description: 'Gentle conversion push with social proof',         color: '#8b5cf6', icon: '👀', steps: '3-step · Email',        action: 'Launch Conversion Flow' },
  }

  const ACTION_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
    abandoned_cart:      { title: 'Recover the abandoned cart',       body: 'This customer left items in their cart. A timed recovery sequence via Email and SMS has a high recovery rate for this segment.' },
    failed_payment:      { title: 'Resolve the failed payment',       body: 'A payment failure is blocking this order. Immediate outreach will recover the transaction before the customer disengages.' },
    dormant_buyer:       { title: 'Win back a dormant customer',      body: 'This customer has gone quiet. A warm win-back sequence with an exclusive offer is the most effective reactivation strategy.' },
    repeat_at_risk:      { title: 'Protect a high-value customer',    body: 'This VIP is showing signs of disengagement. Personal outreach with a premium offer can prevent churn of a valuable relationship.' },
    replenishment:       { title: 'Trigger a replenishment order',    body: 'Based on their purchase history, this customer is likely running low. A timely nudge drives a repeat purchase with minimal friction.' },
    engaged_unconverted: { title: 'Convert a warm browser to buyer',  body: 'This customer is engaged but hasn\'t converted. Social proof and a gentle nudge at the right moment closes the gap.' },
  }

  const stateColor   = STATE_COLORS[customer.state] ?? 'rgba(255,255,255,0.3)'
  const stateLabel   = STATE_LABELS[customer.state] ?? customer.state
  const workflowCfg  = WORKFLOW_CFG[customer.state]
  const actionDesc   = ACTION_DESCRIPTIONS[customer.state]
  const healthLabel  = HEALTH_LABELS[customer.health_band] ?? customer.health_band
  const riskLabel    = customer.health_band === 'red' ? 'HIGH RISK' : customer.health_band === 'yellow' ? 'MEDIUM RISK' : 'LOW RISK'
  const recoveryPct  = Math.min(95, Math.round(customer.opportunity_score * 0.85 + 10))

  const daysSincePurchase = customer.last_purchase_at
    ? Math.floor((Date.now() - new Date(customer.last_purchase_at).getTime()) / 86400000)
    : null

  const customerSince = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  function handleLaunch() {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 1200)
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#070714' }}>
      <div className="max-w-[1100px] px-7 py-6">

        {/* ── Back button ── */}
        <button
          onClick={() => router.push('/customers')}
          className="flex items-center gap-1.5 mb-5 transition-colors group"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16" className="group-hover:opacity-70">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[12px] font-medium group-hover:opacity-70 transition-opacity">Back to Customers</span>
        </button>

        {/* ── Customer Header ── */}
        <div className="rounded-2xl px-6 py-5 mb-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
                style={{ background: HEALTH_BG[customer.health_band] ?? 'rgba(255,255,255,0.1)' }}>
                {ini}
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-white tracking-tight leading-tight">{name}</h1>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <svg width="11" height="11" fill="none" viewBox="0 0 16 16" style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1 6l7 4 7-4" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{customer.email}</span>
                  {customerSince && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                      <svg width="11" height="11" fill="none" viewBox="0 0 16 16" style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M5 1v2M11 1v2M2 6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Customer since {customerSince}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: `${hColor}14`, color: hColor, border: `1px solid ${hColor}28` }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: hColor, boxShadow: `0 0 5px ${hColor}` }} />
                {healthLabel}
              </span>
              {customer.state && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ background: `${stateColor}14`, color: stateColor, border: `1px solid ${stateColor}28` }}>
                  {stateLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="grid grid-cols-[1fr_300px] gap-4 mb-4">

          {/* LEFT: Purchase Intelligence */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
              style={{ color: 'rgba(255,255,255,0.28)' }}>Purchase Intelligence</div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Lifetime Value', value: formatCurrency(customer.total_spend), sub: `${customer.total_orders} total orders`,
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M8 1v14M12 4H6a2 2 0 000 4h4a2 2 0 010 4H4" stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round"/></svg> },
                { label: 'Avg. Order Value', value: formatCurrency(customer.average_order_value ?? 0), sub: 'per transaction',
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M2 12L6 6l3 4 2-2 4 4" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                { label: 'Last Purchase', value: daysSinceLabel(customer.last_purchase_at), sub: daysSincePurchase ? `${daysSincePurchase} days ago` : 'Never purchased',
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#f59e0b" strokeWidth="1.3"/><path d="M5 1v2M11 1v2M2 6h12" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round"/></svg> },
                { label: 'Total Orders', value: String(customer.total_orders), sub: 'completed transactions',
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#00e676" strokeWidth="1.3"/><path d="M6 6h4M6 9h4M6 12h2" stroke="#00e676" strokeWidth="1.3" strokeLinecap="round"/></svg> },
              ].map(({ label, value, sub, icon }) => (
                <div key={label} className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-semibold tracking-[0.13em] uppercase"
                      style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</span>
                    {icon}
                  </div>
                  <div className="text-[18px] font-bold text-white leading-tight">{value}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Score bars */}
            <div className="space-y-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.28)' }}>Health Score</span>
                  <span className="text-[13px] font-bold" style={{ color: hColor }}>{customer.health_score}</span>
                </div>
                <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${customer.health_score}%`, background: hColor, boxShadow: `0 0 8px ${hColor}55` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.28)' }}>Opportunity Score</span>
                  <span className="text-[13px] font-bold" style={{ color: '#00d4ff' }}>{customer.opportunity_score}</span>
                </div>
                <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${customer.opportunity_score}%`, background: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Suggested Action */}
          <div className="flex flex-col gap-3">

            {/* Suggested next action card */}
            <div className="rounded-2xl p-5 flex-1"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
                style={{ color: 'rgba(255,255,255,0.28)' }}>Suggested Next Action</div>

              {workflowCfg && actionDesc ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{ background: `${workflowCfg.color}12`, border: `1px solid ${workflowCfg.color}20` }}>
                      {workflowCfg.icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white leading-tight">{actionDesc.title}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block"
                        style={{ background: `${workflowCfg.color}12`, color: workflowCfg.color, border: `1px solid ${workflowCfg.color}22` }}>
                        {workflowCfg.steps}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {actionDesc.body}
                  </p>
                  <button onClick={handleLaunch} disabled={launching || launched}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={launched
                      ? { background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.22)' }
                      : { background: `${workflowCfg.color}14`, color: workflowCfg.color, border: `1px solid ${workflowCfg.color}28` }
                    }>
                    {launching ? (
                      <><svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10"/>
                      </svg>Launching…</>
                    ) : launched ? (
                      <>✓ Launched</>
                    ) : (
                      <>{workflowCfg.action}</>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.15)' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l3 3 7-7" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="text-[13px] font-semibold" style={{ color: '#00e676' }}>No Action Required</div>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Customer health is strong. Continue standard engagement — no recovery action needed at this time.
                  </p>
                </div>
              )}
            </div>

            {/* Recovery probability */}
            <div className="rounded-2xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.28)' }}>Recovery Probability</span>
                <span className="text-[15px] font-bold" style={{ color: '#00d4ff' }}>{recoveryPct}%</span>
              </div>
              <div className="mt-2 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${recoveryPct}%`, background: 'linear-gradient(90deg, #00d4ff, #7c3aed)' }} />
              </div>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center gap-3 px-1">
              <button onClick={() => router.push('/workflows')}
                className="text-[11px] font-medium transition-colors hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                View all workflows →
              </button>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              <button className="text-[11px] font-medium transition-colors hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                Send manual message
              </button>
            </div>

          </div>
        </div>

        {/* ── Diagnosis ── */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Diagnosis</div>

          <div className="grid grid-cols-[1fr_1fr] gap-4">

            {/* Risk signal */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: `${hColor}08`, border: `1px solid ${hColor}18` }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                  style={{ background: hColor, boxShadow: `0 0 6px ${hColor}` }} />
                <div>
                  <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: hColor }}>{riskLabel}</div>
                  {customer.reason_code && (
                    <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {customer.reason_code}
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue opportunity */}
              <div className="px-4 py-3 rounded-xl"
                style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <svg width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ color: '#00d4ff', flexShrink: 0 }}>
                    <path d="M8 1v14M12 4H6a2 2 0 000 4h4a2 2 0 010 4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{ color: 'rgba(0,212,255,0.6)' }}>Revenue Opportunity</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  This customer has generated{' '}
                  <span className="font-semibold" style={{ color: '#00d4ff' }}>{formatCurrency(customer.total_spend)}</span>
                  {' '}in lifetime value.
                  {daysSincePurchase && daysSincePurchase > 30 && (
                    <> They haven&apos;t purchased in{' '}
                      <span className="font-semibold" style={{ color: '#f59e0b' }}>{daysSincePurchase} days</span>
                      {' '}— recovery is time-sensitive.
                    </>
                  )}
                  {(!daysSincePurchase || daysSincePurchase <= 30) && (
                    <> Recovery is possible with the right outreach strategy.</>
                  )}
                </p>
              </div>
            </div>

            {/* Triggered signals */}
            <div className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.22)' }}>Triggered Signals</div>
              {customer.signals_used && customer.signals_used.length > 0 ? (
                <div className="space-y-2">
                  {customer.signals_used.map((sig: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(0,212,255,0.5)' }} />
                      <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{sig}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  No specific signals triggered
                </div>
              )}

              {/* Last product */}
              {customer.last_product_name && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-[9px] font-semibold tracking-[0.13em] uppercase mb-1"
                    style={{ color: 'rgba(255,255,255,0.22)' }}>Last Product Purchased</div>
                  <div className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {customer.last_product_name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
