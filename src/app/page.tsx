import { supabaseAdmin } from '@/lib/supabase'
import { HealthSummaryChart } from '@/components/dashboard/HealthSummaryChart'
import { SeedButton } from '@/components/dashboard/SeedButton'
import { formatCurrency, stateLabel, stateColor } from '@/lib/utils'
import type { CustomerState } from '@/types'
import Link from 'next/link'

// ─── Data fetchers (all direct Supabase — no internal fetch()) ────────────────

async function getCustomerCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

async function getHealthData() {
  const { data } = await supabaseAdmin
    .from('current_customer_health')
    .select('health_band, state, opportunity_score, total_spend, average_order_value, health_score')
  return data ?? []
}

async function getRecentActivity() {
  const { data } = await supabaseAdmin
    .from('outreach_drafts')
    .select('id, channel, status, generated_at, customer_id')
    .order('generated_at', { ascending: false })
    .limit(6)
  return data ?? []
}

async function getDraftStats() {
  const { data } = await supabaseAdmin
    .from('outreach_drafts')
    .select('status, channel')
  return data ?? []
}

async function getOutcomes() {
  const { data } = await supabaseAdmin
    .from('outcomes')
    .select('outcome_type, revenue_value')
  return data ?? []
}

async function getTopAtRiskCustomers() {
  const { data } = await supabaseAdmin
    .from('current_customer_health')
    .select('customer_id, first_name, last_name, health_band, health_score, opportunity_score, state, total_spend, last_purchase_at')
    .eq('health_band', 'red')
    .order('opportunity_score', { ascending: false })
    .limit(5)
  return data ?? []
}

// ─── Leak config ──────────────────────────────────────────────────────────────

const LEAK_RATES: Record<string, number> = {
  abandoned_cart:      185,
  failed_payment:      210,
  repeat_at_risk:      340,
  dormant_buyer:       280,
  replenishment:       95,
  engaged_unconverted: 120,
}

const LEAK_SOURCES = [
  { key: 'abandoned_cart',      label: 'Abandoned Carts',      color: '#ff4d4d', icon: '🛒' },
  { key: 'failed_payment',      label: 'Failed Payments',      color: '#ff8c00', icon: '💳' },
  { key: 'repeat_at_risk',      label: 'VIPs At Risk',         color: '#f59e0b', icon: '⭐' },
  { key: 'dormant_buyer',       label: 'Dormant Buyers',       color: '#a78bfa', icon: '💤' },
  { key: 'replenishment',       label: 'Missed Replenishment', color: '#00d4ff', icon: '🔄' },
  { key: 'engaged_unconverted', label: 'Unconverted Browsers', color: '#8b5cf6', icon: '👀' },
]

const STATE_ORDER: CustomerState[] = [
  'abandoned_cart', 'failed_payment', 'repeat_at_risk',
  'dormant_buyer', 'replenishment', 'engaged_unconverted',
]

const STATUS_ICONS: Record<string, string> = {
  generated: '📝', approved: '✓', queued: '⏳',
  sent: '↗', skipped: '—', escalated: '⚠',
}

const STATUS_COLORS: Record<string, string> = {
  generated: '#a78bfa', approved: '#00d4ff', queued: '#ffaa00',
  sent: '#00e676', skipped: 'rgba(255,255,255,0.25)', escalated: '#ff6b35',
}

function daysSinceLabel(iso: string | null): string {
  if (!iso) return 'Never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [totalCustomers, health, recentActivity, drafts, outcomes, topAtRisk] =
    await Promise.all([
      getCustomerCount(),
      getHealthData(),
      getRecentActivity(),
      getDraftStats(),
      getOutcomes(),
      getTopAtRiskCustomers(),
    ])

  const hasData = totalCustomers > 0

  // Health distribution
  const red    = health.filter(r => r.health_band === 'red').length
  const yellow = health.filter(r => r.health_band === 'yellow').length
  const green  = health.filter(r => r.health_band === 'green').length
  const total  = health.length
  const dist   = { red, yellow, green, total }

  // At-risk revenue — total_spend of red customers
  const at_risk_revenue = health
    .filter(r => r.health_band === 'red')
    .reduce((sum, r) => sum + (r.total_spend ?? r.average_order_value ?? 0), 0)

  // Draft stats
  const drafts_generated = drafts.length
  const drafts_approved  = drafts.filter(d => ['approved', 'queued', 'sent'].includes(d.status)).length
  const watchlistCount   = yellow

  // Recovered revenue
  const recovered_revenue = outcomes
    .filter(o => o.outcome_type === 'purchased')
    .reduce((sum, o) => sum + (o.revenue_value ?? 0), 0)

  // State breakdown
  const by_state = STATE_ORDER.map(state => ({
    state,
    count: health.filter(r => r.state === state).length,
  }))

  // Leak score
  const leakBreakdown = LEAK_SOURCES.map(s => ({
    ...s,
    count:  health.filter(r => r.state === s.key).length,
    amount: health.filter(r => r.state === s.key).length * LEAK_RATES[s.key],
  }))
  const leakTotal          = leakBreakdown.reduce((sum, s) => sum + s.amount, 0)
  const totalLeakCustomers = leakBreakdown.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="p-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-[#00d4ff]" />
            <h1 className="text-[26px] font-bold text-white">Command Center</h1>
          </div>
          <p className="text-[14px] text-white/45 ml-4">
            Real-time overview of customer health, recovery operations, and revenue impact
          </p>
        </div>
        <SeedButton hasData={hasData} />
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* ── LIVE REVENUE LEAK SCORE ── */}
          {leakTotal > 0 && (
            <LiveLeakScore
              total={leakTotal}
              totalCustomers={totalLeakCustomers}
              breakdown={leakBreakdown}
            />
          )}

          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricCard label="Total Customers"    value={totalCustomers.toString()}        icon="👥" color="#a78bfa" />
            <MetricCard label="Critical & At-Risk" value={red.toString()}                   icon="⚠" color="#ff6b35" sub={`${watchlistCount} on watchlist`} alert={red > 0} />
            <MetricCard label="At-Risk Revenue"    value={formatCurrency(at_risk_revenue)}  icon="$" color="#ff4060" sub="Revenue in jeopardy" />
            <MetricCard label="Recovered Revenue"  value={formatCurrency(recovered_revenue)} icon="↗" color="#00e676" />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard label="Drafts Generated" value={drafts_generated.toString()} icon="📝" color="#a78bfa" small />
            <MetricCard label="Drafts Approved"  value={drafts_approved.toString()}  icon="✓"  color="#00d4ff" small />
            <MetricCard label="Watchlist"         value={watchlistCount.toString()}   icon="👁" color="#ffaa00" small />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4 mb-4">

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 mb-4">Health Distribution</div>
              <HealthSummaryChart distribution={dist} />
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 mb-4">Customer State Breakdown</div>
              <div className="space-y-3">
                {by_state.map(({ state, count }) => {
                  const max   = Math.max(...by_state.map(b => b.count), 1)
                  const pct   = (count / max) * 100
                  const color = stateColor(state)
                  return (
                    <div key={state} className="flex items-center gap-3">
                      <div className="text-[11px] text-white/55 w-32 shrink-0 truncate">{stateLabel(state)}</div>
                      <div className="flex-1 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="text-[12px] font-medium w-5 text-right shrink-0" style={{ color }}>{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 mb-4">Recent Activity</div>
              {recentActivity.length === 0 ? (
                <div className="text-[13px] text-white/25 text-center py-6">No outreach activity yet</div>
              ) : (
                <div className="space-y-2.5">
                  {recentActivity.map((d) => (
                    <div key={d.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0"
                        style={{ background: `${STATUS_COLORS[d.status] ?? '#fff'}18`, color: STATUS_COLORS[d.status] ?? '#fff' }}>
                        {STATUS_ICONS[d.status] ?? '•'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white/75 capitalize truncate">{d.channel} — {d.status}</div>
                        <div className="text-[10px] text-white/30">{daysSinceLabel(d.generated_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4 — Top critical customers */}
          {topAtRisk.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                  Top Critical Customers — Immediate Attention Required
                </div>
                <Link href="/customers?band=red" className="text-[11px] text-[#00d4ff] hover:text-white transition-colors">
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {topAtRisk.map((c) => (
                  <Link key={c.customer_id} href="/customers"
                    className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.05]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg,#8b1a2e,#c0253a)' }}>
                      {(c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-white/90 truncate">{c.first_name} {c.last_name}</div>
                      <div className="text-[11px] text-white/35 truncate">{stateLabel(c.state as CustomerState)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-white/35 mb-1">Health</div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.health_score}%`, background: '#ff4060' }} />
                        </div>
                        <span className="text-[12px] font-medium text-[#ff4060]">{c.health_score}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-16">
                      <div className="text-[11px] text-white/35 mb-0.5">Opp</div>
                      <div className="text-[14px] font-semibold" style={{ color: '#00d4ff' }}>{c.opportunity_score}</div>
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <div className="text-[11px] text-white/35 mb-0.5">LTV</div>
                      <div className="text-[13px] font-medium text-white/80">{formatCurrency(c.total_spend)}</div>
                    </div>
                    <div className="text-right shrink-0 w-20">
                      <div className="text-[11px] text-white/35 mb-0.5">Last purchase</div>
                      <div className="text-[12px] text-white/55">{daysSinceLabel(c.last_purchase_at)}</div>
                    </div>
                    <div className="px-3 py-1 rounded-lg text-[11px] font-medium shrink-0"
                      style={{ background: 'rgba(255,64,96,0.12)', color: '#ff4060', border: '1px solid rgba(255,64,96,0.3)' }}>
                      Act Now
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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
  breakdown: Array<{ key: string; label: string; color: string; icon: string; count: number; amount: number }>
}) {
  const top       = [...breakdown].sort((a, b) => b.amount - a.amount).filter(s => s.amount > 0).slice(0, 4)
  const maxAmount = Math.max(...breakdown.map(b => b.amount), 1)

  return (
    <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(255,64,60,0.07) 0%, rgba(7,7,20,0) 60%)', border: '1px solid rgba(255,64,60,0.18)' }}>

      <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(255,64,60,0.08) 0%, transparent 70%)' }} />

      <div className="relative flex items-start justify-between gap-8">

        {/* Hero number */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ff4040' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#ff4040' }} />
            </span>
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,100,100,0.7)' }}>
              Live Revenue Leak
            </span>
          </div>

          <div className="text-[52px] font-black tracking-tight leading-none"
            style={{ color: '#fff', fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 40px rgba(255,64,60,0.35)' }}>
            {formatCurrency(total)}
          </div>

          <div className="text-[13px] text-white/35 mt-2">
            leaking right now across{' '}
            <span className="text-white/60 font-medium">{totalCustomers} customers</span>
          </div>

          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,230,118,0.07)', border: '1px solid rgba(0,230,118,0.15)' }}>
            <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
              <path d="M2 8h12M10 4l4 4-4 4" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] font-medium" style={{ color: '#00e676' }}>
              {formatCurrency(Math.round(total * 0.32))} estimated recoverable this week
            </span>
          </div>
        </div>

        <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Source breakdown */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {top.map((source) => (
            <div key={source.key} className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${source.color}18` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">{source.icon}</span>
                  <span className="text-[11px] font-medium text-white/55">{source.label}</span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: `${source.color}15`, color: source.color }}>
                  {source.count}
                </span>
              </div>
              <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full"
                  style={{ width: `${(source.amount / maxAmount) * 100}%`, background: source.color, boxShadow: `0 0 6px ${source.color}55` }} />
              </div>
              <div className="text-[16px] font-bold tracking-tight"
                style={{ color: source.color, fontFamily: 'var(--font-jetbrains)' }}>
                {formatCurrency(source.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between mt-5 pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 text-[11px] text-white/25">
          <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Calculated from live customer health scores · Refreshes every 6 hours
        </div>
        <Link href="/customers?band=red" className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
          style={{ color: 'rgba(255,100,100,0.65)' }}>
          View all at-risk customers
          <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon, color, alert = false, small = false }: {
  label: string; value: string; sub?: string; icon: string
  color: string; alert?: boolean; small?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 ${alert ? 'border-[#ff6b35]/25 bg-[#ff6b35]/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/40">{label}</div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
          style={{ background: `${color}18`, color }}>{icon}</div>
      </div>
      <div className={`font-bold text-white ${small ? 'text-[28px]' : 'text-[36px]'}`}
        style={{ fontFamily: 'var(--font-jetbrains)' }}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-white/35 mt-1">{sub}</div>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-5">⚡</div>
      <h2 className="text-[18px] font-semibold text-white mb-2">No customer data loaded</h2>
      <p className="text-[14px] text-white/35 max-w-xs">
        Click <strong className="text-white/60">Load Demo Data</strong> to seed 10 realistic customers and run the scoring engine.
      </p>
    </div>
  )
}
