'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerWithHealth } from '@/types'
import { fullName, initials, formatCurrency, daysSinceLabel, bandColor } from '@/lib/utils'
import {
  Card, CardHeader, SectionLabel, Pill, StatusDot, ProgressBar, Avatar, tokens,
} from '@/components/ui'

type Tone = 'accent' | 'violet' | 'success' | 'warn' | 'danger'

const HEALTH_LABELS: Record<string, string> = { red: 'Critical', yellow: 'Watch', green: 'Good' }
const HEALTH_TONES: Record<string, Tone>     = { red: 'danger',  yellow: 'warn',  green: 'success' }

const STATE_CFG: Record<string, { label: string; tone: Tone }> = {
  abandoned_cart:      { label: 'Abandoned Cart',         tone: 'danger' },
  failed_payment:      { label: 'Failed Payment',         tone: 'warn'   },
  dormant_buyer:       { label: 'Dormant Buyer',          tone: 'violet' },
  repeat_at_risk:      { label: 'VIP at Risk',            tone: 'warn'   },
  replenishment:       { label: 'Replenishment',          tone: 'accent' },
  engaged_unconverted: { label: 'Engaged, Not Converted', tone: 'violet' },
}

const WORKFLOW_CFG: Record<string, { label: string; tone: Tone; steps: string; action: string }> = {
  abandoned_cart:      { label: 'Cart Recovery',      tone: 'danger', steps: '4-step · Email + SMS', action: 'Launch Cart Recovery'     },
  failed_payment:      { label: 'Payment Recovery',   tone: 'warn',   steps: '3-step · Email',        action: 'Launch Payment Recovery'  },
  dormant_buyer:       { label: 'Win-Back Sequence',  tone: 'violet', steps: '4-step · Email + SMS', action: 'Launch Win-Back'          },
  repeat_at_risk:      { label: 'VIP Retention',      tone: 'warn',   steps: '3-step · Email + SMS', action: 'Launch VIP Retention'     },
  replenishment:       { label: 'Replenishment Flow', tone: 'accent', steps: '2-step · SMS',          action: 'Launch Replenishment'     },
  engaged_unconverted: { label: 'Conversion Flow',    tone: 'violet', steps: '3-step · Email',        action: 'Launch Conversion Flow'   },
}

const ACTION_BODY: Record<string, { title: string; body: string }> = {
  abandoned_cart:      { title: 'Recover the abandoned cart',       body: 'This customer left items in their cart. A timed recovery sequence via Email and SMS has a high recovery rate for this segment.' },
  failed_payment:      { title: 'Resolve the failed payment',       body: 'A payment failure is blocking this order. Immediate outreach will recover the transaction before the customer disengages.' },
  dormant_buyer:       { title: 'Win back a dormant customer',      body: 'This customer has gone quiet. A warm win-back sequence with an exclusive offer is the most effective reactivation strategy.' },
  repeat_at_risk:      { title: 'Protect a high-value customer',    body: 'This VIP is showing signs of disengagement. Personal outreach with a premium offer can prevent churn of a valuable relationship.' },
  replenishment:       { title: 'Trigger a replenishment order',    body: 'Based on their purchase history, this customer is likely running low. A timely nudge drives a repeat purchase with minimal friction.' },
  engaged_unconverted: { title: 'Convert a warm browser to buyer',  body: "This customer is engaged but hasn't converted. Social proof and a gentle nudge at the right moment closes the gap." },
}

const TONE_COLORS: Record<Tone, string> = {
  accent: '#00d4ff', violet: '#a78bfa', success: '#3ddc97', warn: '#ffaa00', danger: '#ff4d6a',
}

export function CustomerDetail({
  customer,
  onBack,
}: {
  customer: CustomerWithHealth
  onRefresh: () => void
  onBack?: () => void
}) {
  const router = useRouter()
  const [launching, setLaunching] = useState(false)
  const [launched,  setLaunched]  = useState(false)

  const name   = fullName(customer.first_name, customer.last_name)
  const ini    = initials(customer.first_name, customer.last_name)
  const hColor = bandColor(customer.health_band)

  const stateCfg     = STATE_CFG[customer.state]
  const workflowCfg  = WORKFLOW_CFG[customer.state]
  const actionBody   = ACTION_BODY[customer.state]
  const healthLabel  = HEALTH_LABELS[customer.health_band] ?? customer.health_band
  const healthTone   = HEALTH_TONES[customer.health_band] ?? 'neutral'
  const riskLabel    = customer.health_band === 'red' ? 'High risk' : customer.health_band === 'yellow' ? 'Medium risk' : 'Low risk'
  const recoveryPct  = Math.min(95, Math.round(customer.opportunity_score * 0.85 + 10))

  const daysSincePurchase = customer.last_purchase_at
    ? Math.floor((Date.now() - new Date(customer.last_purchase_at).getTime()) / 86400000)
    : null

  const customerSince = customer.last_purchase_at
    ? new Date(customer.last_purchase_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  function handleLaunch() {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 1200)
  }

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="max-w-[1180px] px-10 py-10">
        {/* Back */}
        <button
          onClick={() => onBack?.()}
          className="flex items-center gap-1.5 mb-5 transition-colors group"
          style={{ color: tokens.textTertiary }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16" className="transition-transform group-hover:-translate-x-0.5">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[12px] font-medium group-hover:text-white/85 transition-colors">Back to Customers</span>
        </button>

        {/* Header card */}
        <Card className="mb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar initials={ini} band={customer.health_band} size={44} />
              <div>
                <h1 className="text-[22px] font-semibold tracking-[-0.01em] leading-tight" style={{ color: tokens.textPrimary }}>
                  {name}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[12px]" style={{ color: tokens.textTertiary }}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1 6l7 4 7-4" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <span>{customer.email}</span>
                  {customerSince && (
                    <>
                      <span style={{ color: tokens.textFaint }}>·</span>
                      <span>Customer since {customerSince}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Pill tone={healthTone}>
                <StatusDot tone={healthTone} size={5} />
                {healthLabel}
              </Pill>
              {stateCfg && <Pill tone={stateCfg.tone}>{stateCfg.label}</Pill>}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-[1fr_320px] gap-4 mb-4">
          {/* Purchase Intelligence */}
          <Card>
            <CardHeader label="Purchase Intelligence" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Lifetime Value',  value: formatCurrency(customer.total_spend),                 sub: `${customer.total_orders} total orders`,                                color: '#00d4ff' },
                { label: 'Avg. Order Value', value: formatCurrency(customer.average_order_value ?? 0),    sub: 'per transaction',                                                       color: '#a78bfa' },
                { label: 'Last Purchase',    value: daysSinceLabel(customer.last_purchase_at),            sub: daysSincePurchase ? `${daysSincePurchase} days ago` : 'Never purchased', color: '#ffaa00' },
                { label: 'Total Orders',     value: String(customer.total_orders),                       sub: 'completed transactions',                                                color: '#3ddc97' },
              ].map(({ label, value, sub, color }) => (
                <div
                  key={label}
                  className="p-4 rounded-[12px]"
                  style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${tokens.borderSubtle}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel className="!text-[9.5px]">{label}</SectionLabel>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}aa` }} />
                  </div>
                  <div className="metric-num text-[20px] leading-none" style={{ color: tokens.textPrimary }}>
                    {value}
                  </div>
                  <div className="text-[11px] mt-2" style={{ color: tokens.textMuted }}>{sub}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${tokens.borderSubtle}` }}>
              <ScoreRow label="Health Score" value={customer.health_score} color={hColor} />
              <ScoreRow label="Opportunity Score" value={customer.opportunity_score} color={tokens.accent} />
            </div>
          </Card>

          {/* Suggested Action */}
          <div className="flex flex-col gap-3">
            <Card className="flex-1">
              <CardHeader label="Suggested Next Action" />

              {workflowCfg && actionBody ? (
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${TONE_COLORS[workflowCfg.tone]}10`,
                        border: `1px solid ${TONE_COLORS[workflowCfg.tone]}28`,
                        color: TONE_COLORS[workflowCfg.tone],
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16">
                        <path d="M3 8l2.5 2.5L13 4"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>
                        {actionBody.title}
                      </div>
                      <div className="mt-2">
                        <Pill tone={workflowCfg.tone}>{workflowCfg.steps}</Pill>
                      </div>
                    </div>
                  </div>
                  <p className="text-[12.5px] leading-relaxed mb-5" style={{ color: tokens.textTertiary }}>
                    {actionBody.body}
                  </p>
                  <button
                    onClick={handleLaunch}
                    disabled={launching || launched}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-[12.5px] font-semibold transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
                    style={
                      launched
                        ? { background: 'rgba(61,220,151,0.10)', color: '#3ddc97', border: '1px solid rgba(61,220,151,0.30)' }
                        : { background: `${TONE_COLORS[workflowCfg.tone]}16`, color: TONE_COLORS[workflowCfg.tone], border: `1px solid ${TONE_COLORS[workflowCfg.tone]}35` }
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
                      <>Launched</>
                    ) : (
                      <>{workflowCfg.action}</>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                      style={{ background: 'rgba(61,220,151,0.08)', border: '1px solid rgba(61,220,151,0.20)' }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l3 3 7-7" stroke="#3ddc97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="text-[13.5px] font-semibold" style={{ color: '#3ddc97' }}>No action required</div>
                  </div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: tokens.textTertiary }}>
                    Customer health is strong. Continue standard engagement — no recovery action is needed at this time.
                  </p>
                </div>
              )}
            </Card>

            <Card padded={false} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Recovery Probability</SectionLabel>
                <span className="metric-num text-[16px]" style={{ color: tokens.accent }}>{recoveryPct}%</span>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${recoveryPct}%`, background: 'linear-gradient(90deg, #00d4ff, #a78bfa)' }} />
              </div>
            </Card>

            <div className="flex items-center gap-3 px-1">
              <button
                onClick={() => router.push('/workflows')}
                className="text-[11.5px] font-medium transition-colors hover:text-white/85"
                style={{ color: tokens.textMuted }}
              >
                View all workflows →
              </button>
              <span style={{ color: tokens.textFaint }}>·</span>
              <button
                className="text-[11.5px] font-medium transition-colors hover:text-white/85"
                style={{ color: tokens.textMuted }}
              >
                Send manual message
              </button>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <Card>
          <CardHeader label="Diagnosis" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div
                className="flex items-start gap-3 px-4 py-4 rounded-[12px]"
                style={{ background: `${hColor}0a`, border: `1px solid ${hColor}22` }}
              >
                <StatusDot tone={healthTone} size={7} />
                <div>
                  <div className="text-[10.5px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: hColor }}>
                    {riskLabel}
                  </div>
                  {customer.reason_code && (
                    <div className="text-[12.5px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                      {customer.reason_code}
                    </div>
                  )}
                </div>
              </div>

              <div
                className="px-4 py-4 rounded-[12px]"
                style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.16)' }}
              >
                <SectionLabel className="mb-2" >Revenue Opportunity</SectionLabel>
                <p className="text-[12.5px] leading-relaxed" style={{ color: tokens.textSecondary }}>
                  This customer has generated{' '}
                  <span className="metric-num font-semibold" style={{ color: tokens.accent }}>
                    {formatCurrency(customer.total_spend)}
                  </span>{' '}in lifetime value.
                  {daysSincePurchase && daysSincePurchase > 30 && (
                    <> They haven&apos;t purchased in{' '}
                      <span className="font-semibold" style={{ color: '#ffaa00' }}>{daysSincePurchase} days</span>{' '}— recovery is time-sensitive.
                    </>
                  )}
                  {(!daysSincePurchase || daysSincePurchase <= 30) && (
                    <> Recovery is possible with the right outreach strategy.</>
                  )}
                </p>
              </div>
            </div>

            <div
              className="px-4 py-4 rounded-[12px]"
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tokens.borderSubtle}` }}
            >
              <SectionLabel className="mb-3">Triggered Signals</SectionLabel>
              {customer.signals_used && customer.signals_used.length > 0 ? (
                <div className="space-y-2">
                  {customer.signals_used.map((sig: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <StatusDot tone="accent" size={5} glow={false} />
                      <span className="text-[12.5px] leading-snug" style={{ color: tokens.textSecondary }}>{sig}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[12.5px]" style={{ color: tokens.textMuted }}>
                  No specific signals triggered.
                </div>
              )}

              {customer.last_product_name && (
                <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${tokens.borderSubtle}` }}>
                  <SectionLabel className="!text-[9.5px] mb-1.5">Last Product Purchased</SectionLabel>
                  <div className="text-[12.5px] font-medium" style={{ color: tokens.textPrimary }}>
                    {customer.last_product_name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <SectionLabel>{label}</SectionLabel>
        <span className="metric-num text-[14px]" style={{ color }}>{value}</span>
      </div>
      <ProgressBar value={value} color={color} height={4} />
    </div>
  )
}
