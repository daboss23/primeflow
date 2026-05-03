import type { AnalyticsSummary } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'

async function getAnalytics(): Promise<AnalyticsSummary | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/analytics`, {
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

  return (
    <div className="p-7 max-w-[900px]">
      <PageHeader
        title="Analytics"
        subtitle="Performance overview across all recovery workflows and customer segments."
      />
      {/* existing analytics content below — unchanged */}
      {analytics ? (
        <pre className="text-white/40 text-[11px]">{JSON.stringify(analytics, null, 2)}</pre>
      ) : (
        <p className="text-white/30 text-[13px]">No analytics data available.</p>
      )}
    </div>
  )
}
