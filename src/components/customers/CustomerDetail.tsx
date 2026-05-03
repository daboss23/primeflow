'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerWithHealth, OutreachDraft } from '@/types'
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
  const [launched, setLaunched]   = useState(false)

  const name   = fullName(customer.first_name, customer.last_name)
  const ini    = initials(customer.first_name, customer.last_name)
  const hColor = bandColor(customer.health_band)

  const HEALTH_LABELS: Record<string, string> = {
    red:    'Critical',
    yellow: 'Watch',
    green:  'Good',
  }

  const STATE_COLORS: Record<string, string> = {
    abandoned_cart:      '#ff4d4d',
    failed_payment:      '#ff8c00',
    dormant_buyer:       '#a78bfa',
    repeat_at_risk:      '#f59e0b',
    replenishment:       '#00d4ff',
    engaged_unconverted: '#8b5cf6',
  }

  const STATE_LABELS: Record<string, string> = {
    abandoned_cart:      'Abandoned Cart',
    failed_payment:      'Failed Payment',
    dormant_buyer:       'Dormant Buyer',
    repeat_at_risk:      'VIP At Risk',
    replenishment:       'Replenishment',
    engaged_unconverted: 'Engaged, Not Converted',
  }

  const WORKFLOW_CFG: Record<string, { label: string; description: string; color: string; icon: string }> = {
    abandoned_cart:      { label: 'Launch Cart Recovery',     description: 'Start a multi-step Email + SMS cart recovery sequence',     color: '#ff4d4d', icon: '🛒' },
    failed_payment:      { label: 'Launch Payment Recovery',  description: 'Send immediate payment recovery outreach via Email',         color: '#ff8c00', icon: '💳' },
    dormant_buyer:       { label: 'Launch Win-Back Sequence', description: 'Start a warm win-back flow across Email + SMS',              color: '#a78bfa', icon: '💤' },
    repeat_at_risk:      { label: 'Launch VIP Retention',     description: 'Start a premium personal outreach sequence for this VIP',   color: '#f59e0b', icon: '⭐' },
    replenishment:       { label: 'Launch Replenishment Flow', description: 'Send a predictive replenishment nudge via SMS',            color: '#00d4ff', icon: '🔄' },
    engaged_unconverted: { label: 'Launch Conversion Flow',   description: 'Start a gentle conversion push via Email',                  color: '#8b5cf6', icon: '👀' },
  }

  const stateColor    = STATE_COLORS[customer.state]   ?? 'rgba(255,255,255,0.3)'
  const stateLabel    = STATE_LABELS[customer.state]   ?? customer.state
  const workflowCfg   = WORKFLOW_CFG[customer.state]
  const healthLabel   = HEALTH_LABELS[customer.health_band] ?? customer.health_band

  function handleLaunch() {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 1200)
  }

  return (
    <div className="p-7 max-w-[780px] fade-in">

      {/* ── HEADER ── */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start justify-between">

          {/* Left: avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
              style={{ background: customer.health_band === 'red' ? 'linear-gradient(135deg,#8b1a2e,#c0253a)' : customer.health_band === 'yellow' ? 'linear-gradient(135deg,#78450a,#b8690f)' : 'linear-gradient(135deg,#0d3320,#0e5c35)' }}>
              {ini}
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-white tracking-tight">{name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{customer.email}</span>
                {customer.last_purchase_at && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Last purchase {new Date(customer.last_purchase_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Health badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: `${hColor}15`, color: hColor, border: `1px solid ${hColor}30` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: hColor, boxShadow: `0 0 5px ${hColor}` }} />
              {healthLabel}
            </span>
            {/* State badge */}
            {customer.state && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: `${stateColor}15`, color: stateColor, border: `1px solid ${stateColor}30` }}>
                {stateLabel}
              </span>
            )}
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Health Score</span>
              <span className="text-[13px] font-bold" style={{ color: hColor }}>{customer.health_score}</span>
            </div>
            <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${customer.health_score}%`, background: hColor, boxShadow: `0 0 6px ${hColor}66` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Opportunity Score</span>
              <span className="text-[13px] font-bold" style={{ color: '#00d4ff' }}>{customer.opportunity_score}</span>
            </div>
            <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${customer.opportunity_score}%`, background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.5)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── PURCHASE INTELLIGENCE + SUGGESTED ACTION ── */}
      <div className="grid grid-cols-[1fr_280px] gap-5 mb-5">

        {/* Purchase intelligence */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Purchase Intelligence</div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Lifetime Value',    value: formatCurrency(customer.total_spend),         icon: '$' },
              { label: 'Avg. Order Value',  value: formatCurrency(customer.average_order_value), icon: '↗' },
              { label: 'Last Purchase',     value: daysSinceLabel(customer.last_purchase_at),    icon: '📅' },
              { label: 'Total Orders',      value: String(customer.total_orders),                icon: '📦' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
                <div className="text-[16px] font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
          {customer.last_product_name && (
            <div className="mt-3 px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1"
                style={{ color: 'rgba(255,255,255,0.25)' }}>Last Product</div>
              <div className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {customer.last_product_name}
              </div>
            </div>
          )}
        </div>

        {/* Suggested next action */}
        <div className="rounded-2xl p-5 flex flex-col"
          style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.14)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-3"
            style={{ color: 'rgba(0,212,255,0.5)' }}>Suggested Next Action</div>

          {customer.suggested_action ? (
            <>
              <div className="flex-1">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                      <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {customer.suggested_action}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Recovery Probability</div>
                <div className="text-[18px] font-bold mt-0.5" style={{ color: '#00d4ff' }}>
                  {Math.min(95, Math.round(customer.opportunity_score * 0.85 + 10))}%
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676' }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-[12px] font-semibold mb-1" style={{ color: '#00e676' }}>No Action Required</div>
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Customer health is strong. Continue standard engagement.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DIAGNOSIS ── */}
      <div className="rounded-2xl p-5 mb-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
          style={{ color: 'rgba(255,255,255,0.28)' }}>Diagnosis</div>

        <div className="space-y-3">
          {/* Risk level */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: `${hColor}08`, border: `1px solid ${hColor}18` }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: hColor, boxShadow: `0 0 6px ${hColor}` }} />
            <span className="text-[12px] font-semibold" style={{ color: hColor }}>
              {customer.health_band === 'red' ? 'HIGH RISK' : customer.health_band === 'yellow' ? 'MEDIUM RISK' : 'LOW RISK'}
            </span>
            {customer.reason_code && (
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                — {customer.reason_code}
              </span>
            )}
          </div>

          {/* Revenue opportunity */}
          <div className="px-4 py-3 rounded-xl"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-1">
              <svg width="11" height="11" fill="none" viewBox="0 0 16 16" style={{ color: '#00d4ff' }}>
                <path d="M8 1v14M12 4H6a2 2 0 000 4h4a2 2 0 010 4H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'rgba(0,212,255,0.6)' }}>
                Revenue Opportunity
              </span>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              This customer has generated <span className="font-semibold" style={{ color: '#00d4ff' }}>
                {formatCurrency(customer.total_spend)}
              </span> in lifetime value. Recovery is possible with the right outreach strategy.
            </p>
          </div>

          {/* Triggered signals */}
          {false && (
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2.5"
                style={{ color: 'rgba(255,255,255,0.22)' }}>Triggered Signals</div>
              <div className="space-y-1.5">
                {customer.signals_used.map((sig: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(0,212,255,0.5)' }} />
                    <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RECOVERY ACTION ── */}
      {workflowCfg && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Recovery Action</div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                style={{ background: `${workflowCfg.color}12`, border: `1px solid ${workflowCfg.color}25` }}>
                {workflowCfg.icon}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white mb-1">{workflowCfg.label}</div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{workflowCfg.description}</div>
              </div>
            </div>

            <button
              onClick={handleLaunch}
              disabled={launching || launched}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all flex-shrink-0 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={launched
                ? { background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.22)' }
                : { background: `${workflowCfg.color}14`, color: workflowCfg.color, border: `1px solid ${workflowCfg.color}30` }
              }
            >
              {launching ? (
                <>
                  <svg className="animate-spin" width="12" height="12" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10"/>
                  </svg>
                  Launching…
                </>
              ) : launched ? (
                <>
                  <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Launched
                </>
              ) : (
                <>
                  <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
                    <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Launch Workflow
                </>
              )}
            </button>
          </div>

          {/* Secondary: view workflows */}
          <div className="flex items-center gap-3 mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => router.push('/workflows')}
              className="text-[11px] font-medium transition-colors hover:text-white/60"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              View all workflows →
            </button>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
            <button
              className="text-[11px] font-medium transition-colors hover:text-white/60"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              Send manual message
            </button>
          </div>
        </div>
      )}

      {/* No workflow state */}
      {!workflowCfg && (
        <div className="rounded-2xl p-5 flex items-center justify-between"
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
            className="text-[11px] font-medium transition-colors hover:text-white/55"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            View workflows →
          </button>
        </div>
      )}

    </div>
  )
}
