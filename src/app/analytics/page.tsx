'use client'

import React, { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  PageHeader, Card, CardHeader, SectionLabel, Pill, ProgressBar, tokens,
} from '@/components/ui'

// ─── Data ────────────────────────────────────────────────────────────────────

const DATA_BY_RANGE: Record<string, {
  trend:   { month: string; recovered: number; customers: number }[]
  kpis:    { revenue: string; customers: string; rate: string; successRate: string }
  sources: { label: string; key: string; pct: number; color: string; amount: number }[]
}> = {
  'This Month': {
    trend: [
      { month: 'W1', recovered: 3200, customers: 7  },
      { month: 'W2', recovered: 4800, customers: 11 },
      { month: 'W3', recovered: 5100, customers: 10 },
      { month: 'W4', recovered: 5300, customers: 10 },
    ],
    kpis: { revenue: '$18,400', customers: '38', rate: '26.8%', successRate: '71%' },
    sources: [
      { label: 'Abandoned Cart',   key: 'cart',        pct: 41, color: '#ff4d6a', amount: 7544  },
      { label: 'VIP Retention',    key: 'vip',         pct: 28, color: '#ffaa00', amount: 5152  },
      { label: 'Dormant Win-Back', key: 'dormant',     pct: 18, color: '#a78bfa', amount: 3312  },
      { label: 'Failed Payment',   key: 'payment',     pct: 9,  color: '#ff7a3d', amount: 1656  },
      { label: 'Replenishment',    key: 'replenish',   pct: 4,  color: '#00d4ff', amount: 736   },
    ],
  },
  'Last 30 Days': {
    trend: [
      { month: 'W1', recovered: 4100, customers: 9  },
      { month: 'W2', recovered: 5600, customers: 12 },
      { month: 'W3', recovered: 6200, customers: 13 },
      { month: 'W4', recovered: 6400, customers: 13 },
    ],
    kpis: { revenue: '$22,300', customers: '47', rate: '24.1%', successRate: '68%' },
    sources: [
      { label: 'Abandoned Cart',   key: 'cart',        pct: 38, color: '#ff4d6a', amount: 8474  },
      { label: 'VIP Retention',    key: 'vip',         pct: 30, color: '#ffaa00', amount: 6690  },
      { label: 'Dormant Win-Back', key: 'dormant',     pct: 20, color: '#a78bfa', amount: 4460  },
      { label: 'Failed Payment',   key: 'payment',     pct: 8,  color: '#ff7a3d', amount: 1784  },
      { label: 'Replenishment',    key: 'replenish',   pct: 4,  color: '#00d4ff', amount: 892   },
    ],
  },
  'Quarter': {
    trend: [
      { month: 'Mar', recovered: 11600, customers: 24 },
      { month: 'Apr', recovered: 14200, customers: 31 },
      { month: 'May', recovered: 18400, customers: 38 },
    ],
    kpis: { revenue: '$49,560', customers: '108', rate: '23.4%', successRate: '68%' },
    sources: [
      { label: 'Abandoned Cart',   key: 'cart',        pct: 41, color: '#ff4d6a', amount: 18400 },
      { label: 'VIP Retention',    key: 'vip',         pct: 28, color: '#ffaa00', amount: 8940  },
      { label: 'Dormant Win-Back', key: 'dormant',     pct: 18, color: '#a78bfa', amount: 6210  },
      { label: 'Failed Payment',   key: 'payment',     pct: 9,  color: '#ff7a3d', amount: 3140  },
      { label: 'Replenishment',    key: 'replenish',   pct: 4,  color: '#00d4ff', amount: 2870  },
    ],
  },
  'Custom Range': {
    trend: [
      { month: 'Nov', recovered: 4200,  customers: 9  },
      { month: 'Dec', recovered: 6800,  customers: 14 },
      { month: 'Jan', recovered: 5400,  customers: 11 },
      { month: 'Feb', recovered: 9100,  customers: 19 },
      { month: 'Mar', recovered: 11600, customers: 24 },
      { month: 'Apr', recovered: 14200, customers: 31 },
      { month: 'May', recovered: 18400, customers: 38 },
    ],
    kpis: { revenue: '$69,900', customers: '152', rate: '22.1%', successRate: '65%' },
    sources: [
      { label: 'Abandoned Cart',   key: 'cart',        pct: 41, color: '#ff4d6a', amount: 28659 },
      { label: 'VIP Retention',    key: 'vip',         pct: 28, color: '#ffaa00', amount: 19572 },
      { label: 'Dormant Win-Back', key: 'dormant',     pct: 18, color: '#a78bfa', amount: 12582 },
      { label: 'Failed Payment',   key: 'payment',     pct: 9,  color: '#ff7a3d', amount: 6291  },
      { label: 'Replenishment',    key: 'replenish',   pct: 4,  color: '#00d4ff', amount: 2796  },
    ],
  },
}

type Tone = 'accent' | 'violet' | 'success' | 'warn' | 'danger'

const WORKFLOWS: { name: string; trigger: string; enrolled: number; converted: number; revenue: number; tone: Tone; trend: string; status: 'performing' | 'watch' }[] = [
  { name: 'Abandoned Cart Recovery', trigger: 'Abandoned Cart', enrolled: 142, converted: 31, revenue: 18400, tone: 'danger',  trend: '+12%', status: 'performing' },
  { name: 'VIP At-Risk Retention',   trigger: 'VIP at Risk',    enrolled: 17,  converted: 9,  revenue: 8940,  tone: 'warn',    trend: '+28%', status: 'performing' },
  { name: 'Dormant Win-Back',        trigger: 'Dormant Buyer',  enrolled: 204, converted: 27, revenue: 6210,  tone: 'violet',  trend: '+7%',  status: 'watch'      },
]

const SEGMENTS = [
  { label: 'VIP Customers',   rate: 74, color: '#ffaa00', revenue: 12400, delta: '+8%'  },
  { label: 'Repeat Buyers',   rate: 58, color: '#00d4ff', revenue: 9800,  delta: '+4%'  },
  { label: 'One-time Buyers', rate: 31, color: '#a78bfa', revenue: 4200,  delta: '+2%'  },
  { label: 'Lapsed (90d+)',   rate: 18, color: '#ff4d6a', revenue: 2100,  delta: '-3%'  },
]

const RANGES = ['This Month', 'Last 30 Days', 'Quarter', 'Custom Range']

// ─── Inline icons ─────────────────────────────────────────────────────────────

const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  cart:     <svg width="13" height="13" viewBox="0 0 16 16" {...s}><path d="M1 1.5h2l2 7h7l1.5-4.5H4.5"/><circle cx="6" cy="13" r="1"/><circle cx="11" cy="13" r="1"/></svg>,
  vip:      <svg width="13" height="13" viewBox="0 0 16 16" {...s}><path d="M8 2l1.4 4.2H14l-3.5 2.5 1.3 4.1L8 10.3l-3.8 2.5 1.3-4.1L2 6.2h4.6z"/></svg>,
  dormant:  <svg width="13" height="13" viewBox="0 0 16 16" {...s}><circle cx="7" cy="5.5" r="2.5"/><path d="M2.5 14c0-2.6 2-4.2 4.5-4.2"/><path d="M11 9h3M12 11h2"/></svg>,
  payment:  <svg width="13" height="13" viewBox="0 0 16 16" {...s}><rect x="1.5" y="4" width="13" height="9" rx="1.5"/><path d="M1.5 7h13"/><path d="M10 10.5l1.5 1.5M11.5 10.5L10 12"/></svg>,
  replenish:<svg width="13" height="13" viewBox="0 0 16 16" {...s}><path d="M13.5 4A6 6 0 1 1 8 2"/><path d="M13.5 1.5v2.5H11"/></svg>,
}

const KPI_ICONS: Record<string, React.ReactNode> = {
  revenue:   <svg width="13" height="13" viewBox="0 0 16 16" {...s}><path d="M2 11l5-5 3 3 4-5"/><path d="M11 4h3v3"/></svg>,
  customers: <svg width="13" height="13" viewBox="0 0 16 16" {...s}><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2"/></svg>,
  rate:      <svg width="13" height="13" viewBox="0 0 16 16" {...s}><circle cx="8" cy="8" r="5.5"/><path d="M5.5 8l2 2 3-3"/></svg>,
  success:   <svg width="13" height="13" viewBox="0 0 16 16" {...s}><path d="M1 8.5h2.5l1.5-4.5 2.5 9 2-5.5 1 1H15"/></svg>,
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[10px] px-3.5 py-2.5"
      style={{ background: 'rgba(12,12,22,0.97)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.7)' }}>
      <div className="eyebrow mb-1.5" style={{ fontSize: 9.5 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-[12px] font-medium metric-num" style={{ color: p.color }}>
            {p.dataKey === 'recovered' ? `$${p.value.toLocaleString()}` : `${p.value} customers`}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [active,    setActive]    = useState('This Month')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  const data   = DATA_BY_RANGE[active]
  const isCustom = active === 'Custom Range'

  const periodLabel = isCustom && startDate && endDate
    ? `${startDate} → ${endDate}`
    : active

  const kpis = [
    { label: 'Recovered Revenue',   value: data.kpis.revenue,     sub: 'across active workflows',   color: '#3ddc97', delta: '+29%', icon: 'revenue'   },
    { label: 'Customers Recovered', value: data.kpis.customers,   sub: 'converted this period',     color: '#00d4ff', delta: '+18%', icon: 'customers' },
    { label: 'Avg Conversion Rate', value: data.kpis.rate,        sub: 'across all workflows',      color: '#a78bfa', delta: '+2.4pp', icon: 'rate'    },
    { label: 'Recovery Success',    value: data.kpis.successRate,  sub: 'workflows on target',       color: '#ffaa00', delta: '+5%', icon: 'success'   },
  ]

  const performingCount = WORKFLOWS.filter(w => w.status === 'performing').length
  const watchCount      = WORKFLOWS.filter(w => w.status === 'watch').length
  const topSource       = data.sources[0]

  return (
    <div className="pl-7 pr-8 py-9 w-full relative">
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        subtitle={`Recovery performance · ${periodLabel}`}
        actions={
          <div className="flex flex-col items-end gap-2">
            {/* Range tabs */}
            <div className="flex items-center gap-1 p-1 rounded-[10px]"
              style={{ background: tokens.surface, border: `1px solid ${tokens.borderSubtle}` }}>
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setActive(r)}
                  className="h-7 px-3 rounded-[7px] text-[11.5px] font-medium transition-all whitespace-nowrap"
                  style={
                    active === r
                      ? { background: 'rgba(0,212,255,0.10)', color: '#00d4ff', boxShadow: '0 0 0 1px rgba(0,212,255,0.28) inset' }
                      : { color: tokens.textTertiary, background: 'transparent' }
                  }
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Custom date range — fixed: proper sizing, min/max constraints, clear feedback */}
            {isCustom && (
              <div className="flex items-center gap-0 rounded-[10px] overflow-hidden"
                style={{ background: tokens.surface, border: `1px solid ${tokens.borderSubtle}` }}>
                <div className="flex flex-col px-4 py-2.5 gap-0.5">
                  <span className="eyebrow" style={{ fontSize: 9 }}>From</span>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                    className="text-[12.5px] bg-transparent outline-none"
                    style={{ color: startDate ? tokens.textPrimary : tokens.textMuted, colorScheme: 'dark', minWidth: 120 }}
                  />
                </div>
                <div className="self-stretch w-px" style={{ background: tokens.borderSubtle }} />
                <div className="flex flex-col px-4 py-2.5 gap-0.5">
                  <span className="eyebrow" style={{ fontSize: 9 }}>To</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                    className="text-[12.5px] bg-transparent outline-none"
                    style={{ color: endDate ? tokens.textPrimary : tokens.textMuted, colorScheme: 'dark', minWidth: 120 }}
                  />
                </div>
                {startDate && endDate && (
                  <>
                    <div className="self-stretch w-px" style={{ background: tokens.borderSubtle }} />
                    <div className="flex items-center px-3">
                      <span className="text-[10.5px] font-semibold" style={{ color: '#3ddc97' }}>Applied</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        }
      />

      {/* Recovery intelligence summary — quick status bar */}
      <div className="flex items-center gap-5 mb-6 px-5 py-3.5 rounded-[12px]"
        style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3ddc97', boxShadow: '0 0 6px rgba(61,220,151,0.7)' }} />
          <span className="text-[12.5px]" style={{ color: tokens.textSecondary }}>
            <span className="font-semibold" style={{ color: tokens.textPrimary }}>{performingCount} workflows</span> above target
          </span>
        </div>
        <div className="w-px h-4 flex-shrink-0" style={{ background: tokens.borderSubtle }} />
        {watchCount > 0 && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ffaa00', boxShadow: '0 0 6px rgba(255,170,0,0.6)' }} />
              <span className="text-[12.5px]" style={{ color: tokens.textSecondary }}>
                <span className="font-semibold" style={{ color: tokens.textPrimary }}>{watchCount} workflow</span> needs attention — low conversion
              </span>
            </div>
            <div className="w-px h-4 flex-shrink-0" style={{ background: tokens.borderSubtle }} />
          </>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11.5px]" style={{ color: tokens.textMuted }}>
            Top recovery source: <span className="font-medium" style={{ color: topSource.color }}>{topSource.label}</span>
            {' '}· {topSource.pct}% of recovered revenue
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {kpis.map(({ label, value, sub, color, delta, icon }) => (
          <Card key={label} padded={false} className="px-6 py-6">
            <div className="flex items-start justify-between mb-4">
              <SectionLabel>{label}</SectionLabel>
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                style={{ background: `${color}14`, color, border: `1px solid ${color}26` }}>
                {KPI_ICONS[icon]}
              </div>
            </div>
            <div className="metric-num text-[32px] leading-none tracking-tight mb-2" style={{ color }}>
              {value}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[5px]"
                style={{ background: 'rgba(61,220,151,0.08)', color: '#3ddc97', border: '1px solid rgba(61,220,151,0.14)' }}>
                {delta}
              </span>
              <span className="text-[11.5px]" style={{ color: tokens.textMuted }}>{sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card className="mb-6">
        <CardHeader
          label={
            <span>
              <span className="block">Revenue Recovered Over Time</span>
              <span className="metric-num text-[22px] block mt-1.5 normal-case tracking-tight"
                style={{ color: tokens.textPrimary, letterSpacing: '-0.01em', fontWeight: 600 }}>
                {data.kpis.revenue}
              </span>
            </span>
          }
          action={<Pill tone="success">+29% vs last period</Pill>}
        />
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="recovered" stroke="#00d4ff" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: '#00d4ff', stroke: '#06060d', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Workflow Performance + Recovery Sources */}
      <div className="grid grid-cols-[1fr_360px] gap-6 mb-6">
        <Card>
          <CardHeader label="Workflow Performance" />
          <div className="space-y-3.5">
            {WORKFLOWS.map((w, i) => {
              const convRate = Math.round((w.converted / w.enrolled) * 100)
              const colorMap: Record<Tone, string> = { accent: '#00d4ff', violet: '#a78bfa', success: '#3ddc97', warn: '#ffaa00', danger: '#ff4d6a' }
              const color = colorMap[w.tone]
              const isWatch = w.status === 'watch'
              return (
                <div key={w.name} className="p-5 rounded-[12px]"
                  style={{
                    background: isWatch ? 'rgba(255,170,0,0.04)' : 'rgba(255,255,255,0.030)',
                    border: `1px solid ${isWatch ? 'rgba(255,170,0,0.18)' : tokens.borderSubtle}`,
                  }}>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[12px] font-semibold metric-num"
                        style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: tokens.textPrimary }}>{w.name}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: tokens.textMuted }}>{w.trigger}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isWatch
                        ? <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: 'rgba(255,170,0,0.10)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.22)' }}>
                            Needs attention
                          </span>
                        : <Pill tone="success">{w.trend}</Pill>
                      }
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3.5">
                    {[
                      { label: 'Enrolled',  value: String(w.enrolled),               vColor: tokens.textSecondary },
                      { label: 'Converted', value: `${w.converted} (${convRate}%)`,  vColor: color },
                      { label: 'Revenue',   value: `$${w.revenue.toLocaleString()}`,  vColor: '#3ddc97' },
                    ].map(({ label, value, vColor }) => (
                      <div key={label} className="px-3 py-2.5 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.028)' }}>
                        <SectionLabel className="!text-[10px] mb-1.5">{label}</SectionLabel>
                        <div className="metric-num text-[13.5px]" style={{ color: vColor }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <ProgressBar value={convRate} color={color} height={2.5} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recovery Sources */}
        <Card>
          <CardHeader label="Recovery by Source" />
          <div className="space-y-4">
            {data.sources.map(({ label, key, pct, color, amount }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5" style={{ color }}>
                    <span style={{ opacity: 0.8 }}>{SOURCE_ICONS[key]}</span>
                    <span className="text-[13px] font-medium" style={{ color: tokens.textSecondary }}>{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="metric-num text-[13px]" style={{ color }}>${amount.toLocaleString()}</span>
                    <span className="text-[11.5px] w-8 text-right" style={{ color: tokens.textMuted }}>{pct}%</span>
                  </div>
                </div>
                <ProgressBar value={pct} color={color} height={2} />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.borderSubtle}` }}>
            <SectionLabel className="mb-4">Customers Recovered / Period</SectionLabel>
            <div style={{ height: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={12}>
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="customers" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Recovery by Segment */}
      <Card>
        <CardHeader label="Recovery by Segment" />
        <div className="grid grid-cols-4 gap-5">
          {SEGMENTS.map(({ label, rate, color, revenue, delta }) => {
            const isNeg = delta.startsWith('-')
            return (
              <div key={label} className="p-5 rounded-[12px]"
                style={{ background: 'rgba(255,255,255,0.030)', border: `1px solid ${tokens.borderSubtle}` }}>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[12px] font-medium" style={{ color: tokens.textSecondary }}>{label}</span>
                  <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[5px]"
                    style={{
                      background: isNeg ? 'rgba(255,77,106,0.08)' : 'rgba(61,220,151,0.08)',
                      color:      isNeg ? '#ff4d6a' : '#3ddc97',
                      border:     `1px solid ${isNeg ? 'rgba(255,77,106,0.18)' : 'rgba(61,220,151,0.14)'}`,
                    }}>
                    {delta}
                  </span>
                </div>
                <div className="metric-num text-[30px] leading-none tracking-tight mb-1" style={{ color }}>{rate}%</div>
                <div className="text-[11px] mb-3.5" style={{ color: tokens.textMuted }}>conversion rate</div>
                <ProgressBar value={rate} color={color} height={2.5} />
                <div className="mt-3.5">
                  <div className="metric-num text-[14px]" style={{ color: '#3ddc97' }}>${revenue.toLocaleString()}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: tokens.textMuted }}>recovered this period</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="flex items-center gap-2 mt-5">
        <span className="w-1 h-1 rounded-full" style={{ background: tokens.textFaint }} />
        <span className="text-[11.5px]" style={{ color: tokens.textMuted }}>
          Connect Shopify and Klaviyo to populate with live recovery data.
        </span>
      </div>
    </div>
  )
}
