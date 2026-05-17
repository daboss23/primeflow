import { hasSupabase, supabaseAdmin } from '@/lib/supabase'
import { DEMO, DEMO_COOKIE } from '@/lib/demo-data'
import { HealthSummaryChart } from '@/components/dashboard/HealthSummaryChart'
import { SeedButton } from '@/components/dashboard/SeedButton'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Card, CardHeader, SectionLabel, StatCard, Pill, StatusDot, ProgressBar, Empty, tokens,
} from '@/components/ui'
import { formatCurrency, stateLabel, stateColor } from '@/lib/utils'
import type { CustomerState } from '@/types'
import Link from 'next/link'
import { cookies } from 'next/headers'

// ─── Demo-mode check ──────────────────────────────────────────────────────────

async function isDemo() {
  if (!hasSupabase) return true
  const jar = await cookies()
  return jar.get(DEMO_COOKIE)?.value === '1'
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getCustomerCount(): Promise<number> {
  if (await isDemo()) return DEMO.health.length
  try {
    const { count } = await supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true })
    return count ?? 0
  } catch { return 0 }
}

async function getHealthData(): Promise<Array<{ health_band: string; state: string; opportunity_score: number; total_spend: number; average_order_value: number; health_score?: number }>> {
  if (await isDemo()) return DEMO.health
  try {
    const { data } = await supabaseAdmin
      .from('current_customer_health')
      .select('health_band, state, opportunity_score, total_spend, average_order_value, health_score')
    return data ?? []
  } catch { return [] }
}

async function getRecentActivity() {
  if (await isDemo()) return DEMO.drafts
  try {
    const { data } = await supabaseAdmin
      .from('outreach_drafts')
      .select('id, channel, status, generated_at, customer_id')
      .order('generated_at', { ascending: false })
      .limit(6)
    return data ?? []
  } catch { return [] }
}

async function getDraftStats() {
  if (await isDemo()) return DEMO.drafts
  try {
    const { data } = await supabaseAdmin
      .from('outreach_drafts')
      .select('status, channel')
    return data ?? []
  } catch { return [] }
}

async function getOutcomes() {
  if (await isDemo()) return DEMO.outcomes
  try {
    const { data } = await supabaseAdmin
      .from('outcomes')
      .select('outcome_type, revenue_value')
    return data ?? []
  } catch { return [] }
}

async function getTopAtRiskCustomers() {
  if (await isDemo()) {
    return DEMO.health
      .filter((c) => c.health_band === 'red')
      .sort((a, b) => b.opportunity_score - a.opportunity_score)
      .slice(0, 5)
  }
  try {
    const { data } = await supabaseAdmin
      .from('current_customer_health')
      .select('customer_id, first_name, last_name, health_band, health_score, opportunity_score, state, total_spend, last_purchase_at')
      .eq('health_band', 'red')
      .order('opportunity_score', { ascending: false })
      .limit(5)
    return data ?? []
  } catch { return [] }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const LEAK_RATES: Record<string, number> = {
  abandoned_cart: 185, failed_payment: 210, repeat_at_risk: 340,
  dormant_buyer:  280, replenishment:    95, engaged_unconverted: 120,
}

const LEAK_SOURCES = [
  { key: 'abandoned_cart',      label: 'Abandoned Carts',      color: '#ff4d6a' },
  { key: 'failed_payment',      label: 'Failed Payments',      color: '#ff8c00' },
  { key: 'repeat_at_risk',      label: 'VIPs At Risk',         color: '#ffaa00' },
  { key: 'dormant_buyer',       label: 'Dormant Buyers',       color: '#a78bfa' },
  { key: 'replenishment',       label: 'Missed Replenishment', color: '#00d4ff' },
  { key: 'engaged_unconverted', label: 'Unconverted Browsers', color: '#7c8cff' },
]

const STATE_ORDER: CustomerState[] = [
  'abandoned_cart', 'failed_payment', 'repeat_at_risk',
  'dormant_buyer', 'replenishment', 'engaged_unconverted',
]

const STATUS_TONE: Record<string, 'violet' | 'accent' | 'warn' | 'success' | 'neutral' | 'danger'> = {
  generated: 'violet', approved: 'accent', queued: 'warn',
  sent: 'success', skipped: 'neutral', escalated: 'danger',
}

function daysSinceLabel(iso: string | null): string {
  if (!iso) return 'Never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30)  return `${d}d ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

// ─── Monoline icons ───────────────────────────────────────────────────────────
const I = {
  users:    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2"/></svg>,
  alert:    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M8 2.5l6 11H2l6-11z"/><path d="M8 7v3"/><circle cx="8" cy="11.7" r="0.5" fill="currentColor"/></svg>,
  dollar:   <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M11 5.5C11 4.4 9.7 3.5 8 3.5S5 4.4 5 5.5s1.3 2 3 2 3 0.9 3 2-1.3 2-3 2-3-0.9-3-2"/><path d="M8 2.5v11"/></svg>,
  trendUp:  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 11l5-5 3 3 4-5"/><path d="M11 4h3v3"/></svg>,
  doc:      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/></svg>,
  check:    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.5 3.5L13 5"/></svg>,
  eye:      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="1.5"/></svg>,
  arrow:    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>,
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [totalCustomers, health, recentActivity, drafts, outcomes, topAtRisk] =
    await Promise.all([
      getCustomerCount(), getHealthData(), getRecentActivity(),
      getDraftStats(), getOutcomes(), getTopAtRiskCustomers(),
    ])

  const hasData = totalCustomers > 0

  const red    = health.filter(r => r.health_band === 'red').length
  const yellow = health.filter(r => r.health_band === 'yellow').length
  const green  = health.filter(r => r.health_band === 'green').length
  const dist   = { red, yellow, green, total: health.length }

  const at_risk_revenue = health
    .filter(r => r.health_band === 'red')
    .reduce((sum, r) => sum + (r.total_spend ?? r.average_order_value ?? 0), 0)

  const drafts_generated = drafts.length
  const drafts_approved  = drafts.filter(d => ['approved', 'queued', 'sent'].includes(d.status)).length
  const watchlistCount   = yellow

  const recovered_revenue = outcomes
    .filter(o => o.outcome_type === 'purchased')
    .reduce((sum, o) => sum + (o.revenue_value ?? 0), 0)

  const by_state = STATE_ORDER.map(state => ({
    state, count: health.filter(r => r.state === state).length,
  }))

  const leakBreakdown = LEAK_SOURCES.map(s => ({
    ...s,
    count:  health.filter(r => r.state === s.key).length,
    amount: health.filter(r => r.state === s.key).length * LEAK_RATES[s.key],
  }))
  const leakTotal          = leakBreakdown.reduce((sum, s) => sum + s.amount, 0)
  const totalLeakCustomers = leakBreakdown.reduce((sum, s) => sum + s.count, 0)
  const totalForState      = health.length

  return (
    <div className="pl-7 pr-8 py-9 w-full relative">
      <PageHeader
        eyebrow="Intelligence Core"
        title="Operator Overview"
        subtitle="Live customer health, recovery operations, and revenue impact across every channel."
        actions={<SeedButton hasData={hasData} />}
      />

      {!hasData ? (
        <EmptyDashboard />
      ) : (
        <>
          {leakTotal > 0 && (
            <LiveLeakScore
              total={leakTotal}
              totalCustomers={totalLeakCustomers}
              breakdown={leakBreakdown}
            />
          )}

          {/* Metric row */}
          <div className="grid grid-cols-4 gap-5 mb-5">
            <StatCard label="Total Customers"     value={totalCustomers.toString()}        icon={I.users}    accent={tokens.violet} />
            <StatCard label="Critical & At-Risk"  value={red.toString()}                   icon={I.alert}    accent="#ff4d6a"
              sub={`${watchlistCount} on watchlist`} />
            <StatCard label="At-Risk Revenue"     value={formatCurrency(at_risk_revenue)}  icon={I.dollar}   accent="#ff4d6a" sub="Revenue in jeopardy" />
            <StatCard label="Recovered Revenue"   value={formatCurrency(recovered_revenue)} icon={I.trendUp} accent="#3ddc97" />
          </div>

          <div className="grid grid-cols-3 gap-5 mb-9">
            <StatCard label="Drafts Generated" value={drafts_generated.toString()} icon={I.doc}   accent={tokens.violet} />
            <StatCard label="Drafts Approved"  value={drafts_approved.toString()}  icon={I.check} accent={tokens.accent} />
            <StatCard label="Watchlist"        value={watchlistCount.toString()}   icon={I.eye}   accent="#ffaa00" />
          </div>

          {/* Distribution + state breakdown */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <Card className="col-span-2">
              <CardHeader label="Health Distribution" />
              <HealthSummaryChart distribution={dist} />
            </Card>
            <Card>
              <CardHeader label="State Breakdown" />
              <div className="space-y-3.5">
                {by_state.map(({ state, count }) => (
                  <div key={state} className="flex items-center justify-between gap-3">
                    <span className="text-[13.5px]" style={{ color: tokens.textSecondary }}>
                      {stateLabel(state)}
                    </span>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-20">
                        <ProgressBar
                          value={totalForState > 0 ? (count / totalForState) * 100 : 0}
                          color={stateColor(state)}
                          height={3}
                        />
                      </div>
                      <span className="metric-num text-[14px] w-5 text-right" style={{ color: tokens.textPrimary }}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <Card className="mb-5">
              <CardHeader label="Recent Outreach Activity" />
              <div className="divide-y" style={{ borderColor: tokens.borderSubtle }}>
                {recentActivity.map((a) => {
                  const tone = STATUS_TONE[a.status] ?? 'neutral'
                  return (
                    <div key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" style={{ borderColor: tokens.borderSubtle }}>
                      <StatusDot tone={tone} />
                      <span className="text-[13px] capitalize" style={{ color: tokens.textSecondary }}>
                        {a.channel}
                      </span>
                      <Pill tone={tone}>{a.status}</Pill>
                      <span className="ml-auto text-[12px]" style={{ color: tokens.textMuted }}>
                        {a.generated_at ? new Date(a.generated_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Top at-risk */}
          {topAtRisk.length > 0 && (
            <Card>
              <CardHeader
                label="Top At-Risk Customers"
                action={
                  <Link href="/customers?band=red" className="text-[11.5px] font-medium flex items-center gap-1.5 transition-colors"
                        style={{ color: tokens.textTertiary }}>
                    View all {I.arrow}
                  </Link>
                }
              />
              <div className="space-y-1.5">
                {topAtRisk.map((c) => (
                  <Link
                    key={c.customer_id}
                    href={`/customers/${c.customer_id}`}
                    className="grid items-center gap-5 px-4 py-3.5 rounded-[10px] border border-transparent transition-all hover:bg-[rgba(255,255,255,0.028)] hover:border-[rgba(255,255,255,0.07)]"
                    style={{ gridTemplateColumns: '36px 1.6fr 1fr 0.7fr 0.9fr 0.9fr auto' }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #4a0d1a 0%, #7d1a30 100%)',
                        border: '1px solid rgba(255,77,106,0.30)',
                      }}
                    >
                      {(c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium truncate" style={{ color: tokens.textPrimary }}>
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-[12.5px] truncate mt-0.5" style={{ color: tokens.textMuted }}>
                        {stateLabel(c.state as CustomerState)}
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow mb-2" style={{ fontSize: 10 }}>Health</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[64px]">
                          <ProgressBar value={c.health_score} color="#ff4d6a" height={3} />
                        </div>
                        <span className="metric-num text-[13px]" style={{ color: '#ff4d6a' }}>{c.health_score}</span>
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow mb-2" style={{ fontSize: 10 }}>Opp</div>
                      <div className="metric-num text-[15px]" style={{ color: tokens.accent }}>{c.opportunity_score}</div>
                    </div>
                    <div>
                      <div className="eyebrow mb-2" style={{ fontSize: 10 }}>LTV</div>
                      <div className="text-[14px] font-medium" style={{ color: tokens.textPrimary }}>
                        {formatCurrency(c.total_spend)}
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow mb-2" style={{ fontSize: 10 }}>Last</div>
                      <div className="text-[13px]" style={{ color: tokens.textSecondary }}>
                        {daysSinceLabel(c.last_purchase_at)}
                      </div>
                    </div>
                    <Pill tone="danger">Act now</Pill>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ─── Live Revenue Leak Score ──────────────────────────────────────────────────

function LiveLeakScore({ total, totalCustomers, breakdown }: {
  total: number
  totalCustomers: number
  breakdown: Array<{ key: string; label: string; color: string; count: number; amount: number }>
}) {
  const top       = [...breakdown].sort((a, b) => b.amount - a.amount).filter(s => s.amount > 0).slice(0, 4)
  const maxAmount = Math.max(...breakdown.map(b => b.amount), 1)

  return (
    <div
      className="rounded-[18px] mb-7 relative overflow-hidden p-8"
      style={{
        background: 'linear-gradient(135deg, rgba(255,77,106,0.07) 0%, rgba(6,6,13,0) 55%), rgba(255,255,255,0.030)',
        border: '1px solid rgba(255,77,106,0.20)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 32px -16px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-[420px] h-[260px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(255,77,106,0.10) 0%, transparent 70%)' }}
      />

      <div className="relative grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1.4fr)] gap-8 items-start">
        {/* Hero */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ff4d6a' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#ff4d6a' }} />
            </span>
            <span className="eyebrow" style={{ color: 'rgba(255,140,160,0.85)' }}>
              Live revenue leak
            </span>
          </div>
          <div
            className="metric-num text-[52px] leading-none tracking-tight"
            style={{ color: '#fff', textShadow: '0 0 40px rgba(255,77,106,0.30)' }}
          >
            {formatCurrency(total)}
          </div>
          <div className="text-[13px] mt-3" style={{ color: tokens.textMuted }}>
            leaking across <span className="font-medium" style={{ color: tokens.textSecondary }}>{totalCustomers} customers</span>
          </div>
          <div
            className="inline-flex items-center gap-2 mt-5 px-3 h-7 rounded-[8px]"
            style={{ background: 'rgba(61,220,151,0.06)', border: '1px solid rgba(61,220,151,0.20)' }}
          >
            <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
              <path d="M2 8h12M10 4l4 4-4 4" stroke="#3ddc97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11.5px] font-medium" style={{ color: '#3ddc97' }}>
              {formatCurrency(Math.round(total * 0.32))} recoverable this week
            </span>
          </div>
        </div>

        <div className="w-px self-stretch" style={{ background: tokens.borderSubtle }} />

        {/* Source grid */}
        <div className="grid grid-cols-2 gap-3">
          {top.map((source) => (
            <div
              key={source.key}
              className="rounded-[12px] px-4 py-3.5"
              style={{
                background: 'rgba(255,255,255,0.032)',
                border: `1px solid ${source.color}28`,
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <StatusDot tone="neutral" glow={false} size={5} />
                  <span className="text-[12px] font-medium" style={{ color: tokens.textSecondary }}>
                    {source.label}
                  </span>
                </div>
                <span
                  className="text-[10.5px] font-semibold metric-num px-1.5 h-4 inline-flex items-center rounded-[5px]"
                  style={{ background: `${source.color}1a`, color: source.color }}
                >
                  {source.count}
                </span>
              </div>
              <ProgressBar value={(source.amount / maxAmount) * 100} color={source.color} height={2} />
              <div
                className="metric-num text-[19px] mt-2.5 tracking-tight"
                style={{ color: source.color }}
              >
                {formatCurrency(source.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative flex items-center justify-between mt-6 pt-4"
        style={{ borderTop: `1px solid ${tokens.borderSubtle}` }}
      >
        <div className="flex items-center gap-2 text-[11.5px]" style={{ color: tokens.textMuted }}>
          <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Calculated from live customer health · refreshes every 6 hours
        </div>
        <Link
          href="/customers?band=red"
          className="flex items-center gap-1.5 text-[11.5px] font-medium transition-colors hover:text-white"
          style={{ color: 'rgba(255,140,160,0.75)' }}
        >
          View all at-risk customers
          <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyDashboard() {
  return (
    <Card padded={false} className="py-20">
      <Empty
        message="No customer data loaded. Click Load Demo Data to seed 10 realistic customers and run the scoring engine."
        icon={
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1l-5 7h4l-1 6 5-7H7l1-6z"/>
          </svg>
        }
      />
    </Card>
  )
}
