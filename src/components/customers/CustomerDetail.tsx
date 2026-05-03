'use client'

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
    red: 'linear-gradient(135deg,#8b1a2e,#c0253a)',
    yellow: 'linear-gradient(135deg,#78450a,#b8690f)',
    green: 'linear-gradient(135deg,#0d3320,#0e5c35)',
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
  const WORKFLOW_CFG: Record<string, { label: string; description: string; color: string; icon: string; steps: string }> = {
    abandoned_cart:      { label: 'Launch Cart Recovery',      description: 'Multi-step Email + SMS cart recovery sequence',        color: '#ff4d4d', icon: '🛒', steps: '4-step · Email + SMS' },
    failed_payment:      { label: 'Launch Payment Recovery',   description: 'Immediate payment recovery outreach via Email',        color: '#ff8c00', icon: '💳', steps: '3-step · Email' },
    dormant_buyer:       { label: 'Launch Win-Back Sequence',  description: 'Warm win-back flow with exclusive comeback offer',     color: '#a78bfa', icon: '💤', steps: '4-step · Email + SMS' },
    repeat_at_risk:      { label: 'Launch VIP Retention',      description: 'Premium personal outreach for high-value customer',    color: '#f59e0b', icon: '⭐', steps: '3-step · Email + SMS' },
    replenishment:       { label: 'Launch Replenishment Flow', description: 'Predictive replenishment nudge via SMS',               color: '#00d4ff', icon: '🔄', steps: '2-step · SMS' },
    engaged_unconverted: { label: 'Launch Conversion Flow',    description: 'Gentle conversion push with social proof',            color: '#8b5cf6', icon: '👀', steps: '3-step · Email' },
  }

  const stateColor  = STATE_COLORS[customer.state] ?? 'rgba(255,255,255,0.3)'
  const stateLabel  = STATE_LABELS[customer.state] ?? customer.state
  const workflowCfg = WORKFLOW_CFG[customer.state]
  const healthLabel = HEALTH_LABELS[customer.health_band] ?? customer.health_band
  const riskLabel   = customer.health_band === 'red' ? 'HIGH RISK' : customer.health_band === 'yellow' ? 'MEDIUM RISK' : 'LOW RISK'
  const recoveryPct = Math.min(95, Math.round(customer.opportunity_score * 0.85 + 10))

  const daysSincePurchase = customer.last_purchase_at
    ? Math.floor((Date.now() - new Date(customer.last_purchase_at).getTime()) / 86400000)
    : null

  function handleLaunch() {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 1200)
  }

  return (
    <div className="p-6 max-w-[820px] fade-in" style={{ color: 'white' }}>

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <div className="rounded-2xl p-6 mb-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Top row: avatar + name + badges */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
              style={{ background: HEALTH_BG[customer.health_band] ?? 'rgba(255,255,255,0.1)' }}>
              {ini}
            </div>
            <div>
              <h2 className="text-[19px] font-bold text-white tracking-tight leading-tight">{name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{customer.email}</span>
                {customer.last_purchase_at && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      Last active {new Date(customer.last_purchase_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: `${hColor}14`, color: hColor, border: `1px solid ${hColor}28` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: hColor, boxShadow: `0 0 5px ${hColor}` }} />
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

        {/* Score bars */}
        <div className="grid grid-cols-2 gap-5 pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Health Score</span>
              <span className="text-[14px] font-bold" style={{ color: hColor }}>{customer.health_score}</span>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${customer.health_score}%`, background: hColor, boxShadow: `0 0 8px ${hColor}55` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Opportunity Score</span>
              <span className="text-[14px] font-bold" style={{ color: '#00d4ff' }}>{customer.opportunity_score}</span>
            </div>
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${customer.opportunity_score}%`, background: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          PURCHASE INTELLIGENCE + NEXT ACTION
      ══════════════════════════════════ */}
      <div className="grid grid-cols-[1fr_260px] gap-4 mb-4">

        {/* Purchase Intelligence */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Purchase Intelligence</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: 'Lifetime Value',   value: formatCurrency(customer.total_spend),         accent: '#00e676' },
              { label: 'Avg Order Value',  value: formatCurrency(customer.average_order_value), accent: '#00d4ff' },
              { label: 'Last Purchase',    value: daysSinceLabel(customer.last_purchase_at),    accent: daysSincePurchase && daysSincePurchase > 60 ? '#f59e0b' : 'rgba(255,255,255,0.7)' },
              { label: 'Total Orders',     value: `${customer.total_orders} orders`,            accent: 'rgba(255,255,255,0.7)' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.22)' }}>{label}</div>
                <div className="text-[15px] font-bold" style={{ color: accent }}>{value}</div>
              </div>
            ))}
          </div>
          {customer.last_product_name && (
            <div className="rounded-xl px-3.5 py-2.5 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase flex-shrink-0"
                style={{ color: 'rgba(255,255,255,0.22)' }}>Last Product</span>
              <span className="text-[12px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {customer.last_product_name}
              </span>
            </div>
          )}
        </div>

        {/* Suggested Next Action */}
        <div className="rounded-2xl p-5 flex flex-col"
          style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.13)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-3"
            style={{ color: 'rgba(0,212,255,0.5)' }}>Suggested Next Action</div>
          {customer.suggested_action ? (
            <>
              <div className="flex-1">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 16 16">
                    <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="currentColor"/>
                  </svg>
                </div>
                <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {customer.suggested_action}
                </p>
              </div>
              <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Recovery Probability</span>
                  <span className="text-[15px] font-bold" style={{ color: '#00d4ff' }}>{recoveryPct}%</span>
                </div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${recoveryPct}%`, background: '#00d4ff' }} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-[13px] font-semibold mb-1.5" style={{ color: '#00e676' }}>No Action Required</div>
              <div className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Customer health is strong. Continue standard engagement.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════
          ENGAGEMENT SIGNALS
      ══════════════════════════════════ */}
      {(customer.email_open_rate !== null || customer.email_click_rate !== null) && (
        <div className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Engagement Signals</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Email Open Rate',
                value: customer.email_open_rate !== null
                  ? `${Math.round((customer.email_open_rate ?? 0) * 100)}%`
                  : '—',
                color: (customer.email_open_rate ?? 0) > 0.3 ? '#00e676' : (customer.email_open_rate ?? 0) > 0.15 ? '#f59e0b' : '#ff4060',
                bar: Math.round((customer.email_open_rate ?? 0) * 100),
              },
              {
                label: 'Email Click Rate',
                value: customer.email_click_rate !== null
                  ? `${Math.round((customer.email_click_rate ?? 0) * 100)}%`
                  : '—',
                color: (customer.email_click_rate ?? 0) > 0.1 ? '#00e676' : (customer.email_click_rate ?? 0) > 0.05 ? '#f59e0b' : '#ff4060',
                bar: Math.round((customer.email_click_rate ?? 0) * 100),
              },
              {
                label: 'Purchase Cadence',
                value: customer.total_orders > 0 ? `${customer.total_orders} orders` : 'First order',
                color: customer.total_orders >= 5 ? '#00e676' : customer.total_orders >= 2 ? '#f59e0b' : '#a78bfa',
                bar: Math.min(100, customer.total_orders * 15),
              },
            ].map(({ label, value, color, bar }) => (
              <div key={label} className="rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-2"
                  style={{ color: 'rgba(255,255,255,0.22)' }}>{label}</div>
                <div className="text-[16px] font-bold mb-2" style={{ color }}>{value}</div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          DIAGNOSIS
      ══════════════════════════════════ */}
      <div className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
          style={{ color: 'rgba(255,255,255,0.28)' }}>Diagnosis</div>

        <div className="space-y-3">

          {/* Risk + reason */}
          <div className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{ background: `${hColor}08`, border: `1px solid ${hColor}18` }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
              style={{ background: hColor, boxShadow: `0 0 6px ${hColor}` }} />
            <div>
              <div className="text-[11px] font-bold tracking-wider mb-1" style={{ color: hColor }}>{riskLabel}</div>
              {customer.reason_code && (
                <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {customer.reason_code}
                </div>
              )}
            </div>
          </div>

          {/* Revenue opportunity */}
          <div className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ color: '#00d4ff', flexShrink: 0 }}>
                <path d="M8 1v14M12 4H6a2 2 0 000 4h4a2 2 0 010 4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(0,212,255,0.6)' }}>
                Revenue Opportunity
              </span>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              This customer has generated{' '}
              <span className="font-semibold" style={{ color: '#00d4ff' }}>{formatCurrency(customer.total_spend)}</span>
              {' '}in lifetime value.
              {daysSincePurchase && daysSincePurchase > 30 && (
                <> They haven&apos;t purchased in <span className="font-semibold" style={{ color: '#f59e0b' }}>{daysSincePurchase} days</span> — recovery is time-sensitive.</>
              )}
              {(!daysSincePurchase || daysSincePurchase <= 30) && (
                <> Recovery is possible with the right outreach strategy.</>
              )}
            </p>
          </div>

          {/* Triggered signals */}
          {customer.signals_used && customer.signals_used.length > 0 && (
            <div className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2.5"
                style={{ color: 'rgba(255,255,255,0.22)' }}>Triggered Signals</div>
              <div className="grid grid-cols-2 gap-1.5">
                {customer.signals_used.map((sig: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(0,212,255,0.5)' }} />
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════
          RECOVERY ACTION
      ══════════════════════════════════ */}
      {workflowCfg ? (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Recovery Action</div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                style={{ background: `${workflowCfg.color}12`, border: `1px solid ${workflowCfg.color}22` }}>
                {workflowCfg.icon}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white mb-0.5">{workflowCfg.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{workflowCfg.description}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: `${workflowCfg.color}12`, color: workflowCfg.color, border: `1px solid ${workflowCfg.color}22` }}>
                    {workflowCfg.steps}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLaunch}
              disabled={launching || launched}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all flex-shrink-0 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={launched
                ? { background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.22)' }
                : { background: `${workflowCfg.color}14`, color: workflowCfg.color, border: `1px solid ${workflowCfg.color}28` }
              }
            >
              {launching ? (
                <><svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10"/>
                </svg>Launching…</>
              ) : launched ? (
                <><svg width="11" height="11" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>Launched</>
              ) : (
                <><svg width="11" height="11" fill="none" viewBox="0 0 16 16">
                  <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>Launch Workflow</>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => router.push('/workflows')}
              className="text-[11px] font-medium hover:text-white/60 transition-colors"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              View all workflows →
            </button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            <button className="text-[11px] font-medium hover:text-white/60 transition-colors"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              Send manual message
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.12)' }}>
          <div className="flex items-center gap-3">
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" stroke="#00e676" strokeWidth="1.3"/>
              <path d="M5 8l2 2 4-4" stroke="#00e676" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              No recovery action needed — customer is healthy and engaged.
            </span>
          </div>
          <button onClick={() => router.push('/workflows')}
            className="text-[11px] font-medium hover:text-white/55 transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            View workflows →
          </button>
        </div>
      )}

    </div>
  )
}