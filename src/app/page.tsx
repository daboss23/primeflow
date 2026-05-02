import { supabaseAdmin } from '@/lib/supabase'
import { StatCard } from '@/components/ui'
import { HealthSummaryChart } from '@/components/dashboard/HealthSummaryChart'
import { SeedButton } from '@/components/dashboard/SeedButton'
import { formatCurrency, stateLabel, stateColor } from '@/lib/utils'
import type { AnalyticsSummary, StateBreakdown, CustomerState } from '@/types'
import Link from 'next/link'

async function getAnalytics(): Promise<AnalyticsSummary | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getCustomerCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

async function getRecentActivity() {
  const { data } = await supabaseAdmin
    .from('outreach_drafts')
    .select('id, channel, status, generated_at, customer_id')
    .order('generated_at', { ascending: false })
    .limit(6)
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

const STATE_ORDER: CustomerState[] = [
  'abandoned_cart', 'failed_payment', 'repeat_at_risk',
  'dormant_buyer', 'replenishment', 'engaged_unconverted',
]

const STATUS_ICONS: Record<string, string> = {
  generated: '📝',
  approved: '✓',
  queued: '⏳',
  sent: '↗',
  skipped: '—',
  escalated: '⚠',
}

const STATUS_COLORS: Record<string, string> = {
  generated: '#a78bfa',
  approved: '#00d4ff',
  queued: '#ffaa00',
  sent: '#00e676',
  skipped: 'rgba(255,255,255,0.25)',
  escalated: '#ff6b35',
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

export default async function DashboardPage() {
  const [analytics, totalCustomers, recentActivity, topAtRisk] = await Promise.all([
    getAnalytics(),
    getCustomerCount(),
    getRecentActivity(),
    getTopAtRiskCustomers(),
  ])

  const dist = analytics?.health_distribution
  const hasData = totalCustomers > 0
  const criticalCount = (dist?.red ?? 0)
  const watchlistCount = (dist?.yellow ?? 0)

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
          {/* Row 1 — Primary stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricCard
              label="Total Customers"
              value={totalCustomers.toString()}
              icon="👥"
              color="#a78bfa"
            />
            <MetricCard
              label="Critical & At-Risk"
              value={criticalCount.toString()}
              sub={`${watchlistCount} on watchlist`}
              icon="⚠"
              color="#ff6b35"
              alert={criticalCount > 0}
            />
            <MetricCard
              label="At-Risk Revenue"
              value={formatCurrency(analytics?.at_risk_revenue ?? 0)}
              sub="Revenue in jeopardy"
              icon="$"
              color="#ff4060"
            />
            <MetricCard
              label="Recovered Revenue"
              value={formatCurrency(analytics?.recovered_revenue ?? 0)}
              icon="↗"
              color="#00e676"
            />
          </div>

          {/* Row 2 — Secondary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard
              label="Drafts Generated"
              value={(analytics?.drafts_generated ?? 0).toString()}
              icon="📝"
              color="#a78bfa"
              small
            />
            <MetricCard
              label="Drafts Approved"
              value={(analytics?.drafts_approved ?? 0).toString()}
              icon="✓"
              color="#00d4ff"
              small
            />
            <MetricCard
              label="Watchlist"
              value={watchlistCount.toString()}
              icon="👁"
              color="#ffaa00"
              small
            />
          </div>

          {/* Row 3 — Charts + Activity */}
          <div className="grid grid-cols-3 gap-4 mb-4">

            {/* Health distribution */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 mb-4">
                Health Distribution
              </div>
              {dist && <HealthSummaryChart distribution={dist} />}
            </div>

            {/* State breakdown — horizontal bars */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 mb-4">
                Customer State Breakdown
              </div>
              <div className="space-y-3">
                {analytics && STATE_ORDER.map((s) => {
                  const item = analytics.by_state.find((b) => b.state === s)
                  const count = item?.count ?? 0
                  const max = Math.max(...analytics.by_state.map((b) => b.count), 1)
                  const pct = (count / max) * 100
                  const color = stateColor(s)
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="text-[11px] text-white/55 w-32 shrink-0 truncate">
                        {stateLabel(s)}
                      </div>
                      <div className="flex-1 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <div
                        className="text-[12px] font-medium w-5 text-right shrink-0"
                        style={{ color }}
                      >
                        {count}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-[11px] uppercase tracking-[0.14em] text-white/40 mb-4">
                Recent Activity
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-[13px] text-white/25 text-center py-6">
                  No outreach activity yet
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentActivity.map((d) => (
                    <div key={d.id} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0"
                        style={{
                          background: `${STATUS_COLORS[d.status] ?? '#fff'}18`,
                          color: STATUS_COLORS[d.status] ?? '#fff',
                        }}
                      >
                        {STATUS_ICONS[d.status] ?? '•'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white/75 capitalize truncate">
                          {d.channel} — {d.status}
                        </div>
                        <div className="text-[10px] text-white/30">
                          {daysSinceLabel(d.generated_at)}
                        </div>
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
                <Link
                  href="/customers?band=red"
                  className="text-[11px] text-[#00d4ff] hover:text-white transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {topAtRisk.map((c) => (
                  <Link
                    key={c.customer_id}
                    href="/customers"
                    className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.05]"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg,#8b1a2e,#c0253a)' }}
                    >
                      {(c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-white/90 truncate">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-[11px] text-white/35 truncate">
                        {stateLabel(c.state as CustomerState)}
                      </div>
                    </div>

                    {/* Health score */}
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-white/35 mb-1">Health</div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${c.health_score}%`, background: '#ff4060' }}
                          />
                        </div>
                        <span className="text-[12px] font-medium text-[#ff4060]">
                          {c.health_score}
                        </span>
                      </div>
                    </div>

                    {/* Opp score */}
                    <div className="text-right shrink-0 w-16">
                      <div className="text-[11px] text-white/35 mb-0.5">Opp</div>
                      <div
                        className="text-[14px] font-semibold"
                        style={{ color: '#00d4ff' }}
                      >
                        {c.opportunity_score}
                      </div>
                    </div>

                    {/* Spend */}
                    <div className="text-right shrink-0 w-20">
                      <div className="text-[11px] text-white/35 mb-0.5">LTV</div>
                      <div className="text-[13px] font-medium text-white/80">
                        {formatCurrency(c.total_spend)}
                      </div>
                    </div>

                    {/* Last purchase */}
                    <div className="text-right shrink-0 w-20">
                      <div className="text-[11px] text-white/35 mb-0.5">Last purchase</div>
                      <div className="text-[12px] text-white/55">
                        {daysSinceLabel(c.last_purchase_at)}
                      </div>
                    </div>

                    {/* Action badge */}
                    <div
                      className="px-3 py-1 rounded-lg text-[11px] font-medium shrink-0"
                      style={{
                        background: 'rgba(255,64,96,0.12)',
                        color: '#ff4060',
                        border: '1px solid rgba(255,64,96,0.3)',
                      }}
                    >
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

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon, color, alert = false, small = false,
}: {
  label: string
  value: string
  sub?: string
  icon: string
  color: string
  alert?: boolean
  small?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${alert ? 'border-[#ff6b35]/25 bg-[#ff6b35]/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/40">{label}</div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
      </div>
      <div
        className={`font-bold text-white ${small ? 'text-[28px]' : 'text-[36px]'}`}
        style={{ fontFamily: 'var(--font-jetbrains)' }}
      >
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
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-5">
        ⚡
      </div>
      <h2 className="text-[18px] font-semibold text-white mb-2">No customer data loaded</h2>
      <p className="text-[14px] text-white/35 max-w-xs">
        Click <strong className="text-white/60">Load Demo Data</strong> to seed 10 realistic
        customers and run the scoring engine.
      </p>
    </div>
  )
}
