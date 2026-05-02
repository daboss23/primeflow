import type { AnalyticsSummary } from '@/types'
import { StatCard } from '@/components/ui'
import { HealthSummaryChart, StateBreakdownList } from '@/components/dashboard/HealthSummaryChart'
import { ChannelBreakdown } from '@/components/analytics/ChannelBreakdown'
import { formatCurrency } from '@/lib/utils'

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

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()
  const dist = analytics?.health_distribution

  return (
    <div className="p-7 max-w-[1100px]">
      <div className="mb-7">
        <h2 className="text-[18px] font-semibold text-white">Analytics</h2>
        <p className="text-[12px] text-white/35 mt-1">Outreach performance & reactivation results</p>
      </div>

      {/* Outreach KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Drafts Generated"
          value={analytics?.drafts_generated ?? 0}
          color="#a78bfa"
        />
        <StatCard
          label="Drafts Approved"
          value={analytics?.drafts_approved ?? 0}
          color="#00d4ff"
        />
        <StatCard
          label="Drafts Sent"
          value={analytics?.drafts_sent ?? 0}
          color="#ffaa00"
        />
        <StatCard
          label="Recovered Revenue"
          value={formatCurrency(analytics?.recovered_revenue ?? 0)}
          color="#00e676"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mb-7">
        <StatCard
          label="Reply Rate"
          value={
            analytics
              ? `${(analytics.reply_rate * 100).toFixed(1)}%`
              : '—'
          }
          color="#00d4ff"
          sub="Of sent outreach"
        />
        <StatCard
          label="Conversion Rate"
          value={
            analytics
              ? `${(analytics.conversion_rate * 100).toFixed(1)}%`
              : '—'
          }
          color="#00e676"
          sub="Sent → Purchase"
        />
        <StatCard
          label="At-Risk Revenue"
          value={formatCurrency(analytics?.at_risk_revenue ?? 0)}
          color="#ff4060"
          sub="From red customers"
        />
        <StatCard
          label="Total Customers"
          value={dist?.total ?? 0}
          color="#e8e8f4"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[9px] uppercase tracking-[0.12em] text-white/30 mb-4">
            Health Distribution
          </div>
          {dist ? (
            <HealthSummaryChart distribution={dist} />
          ) : (
            <div className="text-white/25 text-xs">No data</div>
          )}
        </div>

        <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[9px] uppercase tracking-[0.12em] text-white/30 mb-4">
            Customers by State
          </div>
          {analytics ? (
            <StateBreakdownList
              states={analytics.by_state}
              total={dist?.total ?? 0}
            />
          ) : (
            <div className="text-white/25 text-xs">No data</div>
          )}
        </div>
      </div>

      {/* Channel breakdown */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="text-[9px] uppercase tracking-[0.12em] text-white/30 mb-4">
          Outreach by Channel
        </div>
        {analytics ? (
          <ChannelBreakdown channels={analytics.outreach_by_channel} />
        ) : (
          <div className="text-white/25 text-xs">No data</div>
        )}
      </div>
    </div>
  )
}
