import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrintButton } from '@/components/report/PrintButton'

const SIGNUP_URL = 'http://localhost:3000'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

async function getReport(id: string) {
  const { data } = await supabaseAdmin
    .from('revenue_reports')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getReport(id)
  if (!report) notFound()

  const results = report.results_json?.by_state as Array<{
    label: string; color: string; customers: number;
    at_risk: number; recoverable: number;
  }> ?? []

  const maxAt = Math.max(...results.map((s) => s.at_risk), 1)
  const roi = Math.round(report.total_recoverable / 300)
  const gap = Math.max(0, report.total_recoverable - (report.current_recovery ?? 0))

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-[780px] mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="text-[13px] font-bold tracking-[0.16em] text-white mb-1 uppercase">
            Revenue <span className="text-[#00d4ff]">Recovery</span> Engine
          </div>
          <div className="text-[11px] tracking-[0.2em] text-white/50 uppercase mb-8">
            Revenue Gap Report
          </div>
          <h1 className="text-[34px] font-bold text-white leading-tight mb-3">
            Your store is leaving money on the table.
          </h1>
          <p className="text-[17px] text-white/65">
            {report.store_url ? `Analysis for ${report.store_url}` : 'Your personalised revenue gap analysis.'}
            {report.industry ? ` · ${report.industry}` : ''}
          </p>
          <PrintButton />
        </div>

        {/* Hero numbers */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-6">
            <div className="text-[12px] uppercase tracking-widest text-red-400 mb-2">Revenue at Risk Per Month</div>
            <div className="text-[40px] font-bold text-red-400">{fmt(report.total_at_risk)}</div>
            <div className="text-[14px] text-white/55 mt-1">Sitting in leaking buckets right now</div>
          </div>
          <div className="rounded-xl border border-[#00e676]/25 bg-[#00e676]/[0.06] p-6">
            <div className="text-[12px] uppercase tracking-widest text-[#00e676] mb-2">Recoverable Per Month</div>
            <div className="text-[40px] font-bold text-[#00e676]">{fmt(report.total_recoverable)}</div>
            <div className="text-[14px] text-white/55 mt-1">{fmt(report.total_recoverable * 12)} per year</div>
          </div>
        </div>

        {/* Recovery gap */}
        {(report.current_recovery ?? 0) > 0 && (
          <div className="rounded-xl border border-[#ffaa00]/25 bg-[#ffaa00]/[0.05] p-5 mb-5">
            <div className="text-[12px] uppercase tracking-widest text-[#ffaa00] mb-2">Your Recovery Gap</div>
            <p className="text-[16px] text-white/80 leading-relaxed">
              You are currently recovering{' '}
              <strong className="text-[#ffaa00]">{fmt(report.current_recovery)}</strong> per month.
              That means <strong className="text-white">{fmt(gap)}</strong> per month is still being
              left behind — <strong className="text-white">{fmt(gap * 12)}</strong> per year.
            </p>
          </div>
        )}

        {/* Breakdown */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-5">
          <div className="text-[12px] uppercase tracking-widest text-white/50 mb-5">Where the Revenue is Leaking</div>
          <div className="space-y-4">
            {results.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.color, boxShadow: `0 0 4px ${s.color}88` }} />
                    <span className="text-[15px] text-white/90">{s.label}</span>
                    <span className="text-[12px] text-white/45">~{s.customers.toLocaleString()} customers</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[14px] text-white/65">{fmt(s.at_risk)}</span>
                    <span className="text-[14px] text-[#00e676] ml-2 font-medium">→ {fmt(s.recoverable)}</span>
                  </div>
                </div>
                <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${(s.at_risk / maxAt) * 100}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI */}
        <div className="rounded-xl border border-[#a78bfa]/25 bg-[#a78bfa]/[0.05] p-6 mb-5">
          <div className="text-[12px] uppercase tracking-widest text-[#a78bfa] mb-5 text-center">
            Revenue Recovery Engine ROI
          </div>
          <div className="flex justify-center items-center gap-16">
            <div className="text-center">
              <div className="text-[36px] font-bold text-[#00e676]">{fmt(report.total_recoverable)}</div>
              <div className="text-[13px] text-white/50 mt-1">Recovered/mo</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] font-bold text-[#00d4ff]">{roi}x</div>
              <div className="text-[13px] text-white/50 mt-1">Return on investment</div>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div className="rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] p-6 mb-8">
          <div className="text-[12px] uppercase tracking-widest text-[#00d4ff] mb-3">What This Means</div>
          <p className="text-[16px] text-white/80 leading-relaxed">
            You&apos;re currently recovering{' '}
            <strong className="text-[#ffaa00]">{fmt(report.current_recovery ?? 0)}</strong> per month.
            The Recovery Engine could potentially recover{' '}
            <strong className="text-[#00e676]">{fmt(report.total_recoverable)}</strong> per month
            {' '}— that&apos;s an extra{' '}
            <strong className="text-white">{fmt(gap)}</strong> left on the table every month.
          </p>
        </div>

        {/* CTA */}
        
        <div className="text-center mt-8 text-[12px] text-white/30">
          * Estimates based on published DTC ecommerce benchmarks. Actual results vary by brand, category, and outreach quality.
        </div>

      </div>
    </div>
  )
}
