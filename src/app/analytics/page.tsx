'use client'

import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  PageHeader, Card, CardHeader, SectionLabel, Pill, StatusDot, ProgressBar, tokens,
} from '@/components/ui'

const DATA_BY_RANGE: Record<string, {
  trend: { month: string; recovered: number; customers: number }[]
  kpis: { revenue: string; customers: string; rate: string; performance: string }
  sources: { label: string; pct: number; color: string; amount: number }[]
}> = {
  'This Month': {
    trend: [
      { month: 'W1', recovered: 3200, customers: 7  },
      { month: 'W2', recovered: 4800, customers: 11 },
      { month: 'W3', recovered: 5100, customers: 10 },
      { month: 'W4', recovered: 5300, customers: 10 },
    ],
    kpis: { revenue: '$18,400', customers: '38', rate: '26.8%', performance: '71%' },
    sources: [
      { label: 'Abandoned Cart',   pct: 41, color: '#ff4d6a', amount: 7544  },
      { label: 'VIP Retention',    pct: 28, color: '#ffaa00', amount: 5152  },
      { label: 'Dormant Win-Back', pct: 18, color: '#a78bfa', amount: 3312  },
      { label: 'Failed Payment',   pct: 9,  color: '#ff7a3d', amount: 1656  },
      { label: 'Replenishment',    pct: 4,  color: '#00d4ff', amount: 736   },
    ],
  },
  'Last 30 Days': {
    trend: [
      { month: 'W1', recovered: 4100, customers: 9  },
      { month: 'W2', recovered: 5600, customers: 12 },
      { month: 'W3', recovered: 6200, customers: 13 },
      { month: 'W4', recovered: 6400, customers: 13 },
    ],
    kpis: { revenue: '$22,300', customers: '47', rate: '24.1%', performance: '68%' },
    sources: [
      { label: 'Abandoned Cart',   pct: 38, color: '#ff4d6a', amount: 8474  },
      { label: 'VIP Retention',    pct: 30, color: '#ffaa00', amount: 6690  },
      { label: 'Dormant Win-Back', pct: 20, color: '#a78bfa', amount: 4460  },
      { label: 'Failed Payment',   pct: 8,  color: '#ff7a3d', amount: 1784  },
      { label: 'Replenishment',    pct: 4,  color: '#00d4ff', amount: 892   },
    ],
  },
  'Quarter': {
    trend: [
      { month: 'Mar', recovered: 11600, customers: 24 },
      { month: 'Apr', recovered: 14200, customers: 31 },
      { month: 'May', recovered: 18400, customers: 38 },
    ],
    kpis: { revenue: '$49,560', customers: '108', rate: '23.4%', performance: '68%' },
    sources: [
      { label: 'Abandoned Cart',   pct: 41, color: '#ff4d6a', amount: 18400 },
      { label: 'VIP Retention',    pct: 28, color: '#ffaa00', amount: 8940  },
      { label: 'Dormant Win-Back', pct: 18, color: '#a78bfa', amount: 6210  },
      { label: 'Failed Payment',   pct: 9,  color: '#ff7a3d', amount: 3140  },
      { label: 'Replenishment',    pct: 4,  color: '#00d4ff', amount: 2870  },
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
    kpis: { revenue: '$69,900', customers: '152', rate: '22.1%', performance: '65%' },
    sources: [
      { label: 'Abandoned Cart',   pct: 41, color: '#ff4d6a', amount: 28659 },
      { label: 'VIP Retention',    pct: 28, color: '#ffaa00', amount: 19572 },
      { label: 'Dormant Win-Back', pct: 18, color: '#a78bfa', amount: 12582 },
      { label: 'Failed Payment',   pct: 9,  color: '#ff7a3d', amount: 6291  },
      { label: 'Replenishment',    pct: 4,  color: '#00d4ff', amount: 2796  },
    ],
  },
}

type Tone = 'accent' | 'violet' | 'success' | 'warn' | 'danger'

const TOP_CAMPAIGNS: { name: string; trigger: string; enrolled: number; converted: number; revenue: number; tone: Tone; trend: string }[] = [
  { name: 'Abandoned Cart Recovery', trigger: 'Abandoned Cart', enrolled: 142, converted: 31, revenue: 18400, tone: 'danger',  trend: '+12%' },
  { name: 'VIP At-Risk Retention',   trigger: 'VIP at Risk',    enrolled: 17,  converted: 9,  revenue: 8940,  tone: 'warn',    trend: '+28%' },
  { name: 'Dormant Win-Back',        trigger: 'Dormant Buyer',  enrolled: 204, converted: 27, revenue: 6210,  tone: 'violet',  trend: '+7%'  },
]

const SEGMENT_PERFORMANCE = [
  { label: 'VIP Customers',   rate: 74, color: '#ffaa00', revenue: 12400 },
  { label: 'Repeat Buyers',   rate: 58, color: '#00d4ff', revenue: 9800  },
  { label: 'One-time Buyers', rate: 31, color: '#a78bfa', revenue: 4200  },
  { label: 'Lapsed (90d+)',   rate: 18, color: '#ff4d6a', revenue: 2100  },
]

const RANGES = ['This Month', 'Last 30 Days', 'Quarter', 'Custom Range']

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-[10px] px-3.5 py-2.5"
      style={{
        background: 'rgba(15,15,25,0.96)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 12px 32px -8px rgba(0,0,0,0.6)',
      }}
    >
      <div className="eyebrow mb-1.5" style={{ fontSize: 9.5 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-[12px] font-medium metric-num" style={{ color: p.color }}>
            {p.dataKey === 'recovered' ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [active, setActive]       = useState('This Month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')

  const data = DATA_BY_RANGE[active]
  const kpis = [
    { label: 'Recovered Revenue',    value: data.kpis.revenue,     sub: 'across active workflows',           color: '#3ddc97' },
    { label: 'Customers Recovered',  value: data.kpis.customers,   sub: 'converted this period',             color: '#00d4ff' },
    { label: 'Avg Conversion Rate',  value: data.kpis.rate,        sub: 'across all campaigns',              color: '#a78bfa' },
    { label: 'Workflow Performance', value: data.kpis.performance, sub: 'avg success across 4 workflows',    color: '#ffaa00' },
  ]

  return (
    <div className="px-10 py-10 max-w-[1440px] relative">
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        subtitle={`Recovery performance overview · ${active === 'Custom Range' && startDate && endDate ? `${startDate} → ${endDate}` : active}`}
        actions={
          <div className="flex flex-col items-end gap-2">
            <div
              className="flex items-center gap-1 p-1 rounded-[10px]"
              style={{ background: tokens.surface, border: `1px solid ${tokens.borderSubtle}` }}
            >
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

            {active === 'Custom Range' && (
              <div
                className="flex items-center gap-2 px-3 h-9 rounded-[10px]"
                style={{ background: tokens.surface, border: `1px solid ${tokens.borderSubtle}` }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 16 16" style={{ color: tokens.textTertiary, flexShrink: 0 }}>
                  <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 6h14M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="text-[11.5px] outline-none bg-transparent"
                  style={{ color: startDate ? tokens.textSecondary : tokens.textMuted, colorScheme: 'dark' }}
                />
                <span style={{ color: tokens.textMuted, fontSize: 11 }}>→</span>
                <input
                  type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="text-[11.5px] outline-none bg-transparent"
                  style={{ color: endDate ? tokens.textSecondary : tokens.textMuted, colorScheme: 'dark' }}
                />
              </div>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {kpis.map(({ label, value, sub, color }) => (
          <Card key={label} padded={false} className="px-5 py-5">
            <SectionLabel className="mb-4">{label}</SectionLabel>
            <div className="metric-num text-[30px] leading-none tracking-tight mb-2" style={{ color }}>
              {value}
            </div>
            <div className="text-[11.5px]" style={{ color: tokens.textMuted }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card className="mb-5">
        <CardHeader
          label={
            <span>
              <span className="block">Revenue Recovered Over Time</span>
              <span className="metric-num text-[22px] block mt-2 normal-case tracking-tight" style={{ color: tokens.textPrimary, letterSpacing: '-0.01em', fontWeight: 600 }}>
                {data.kpis.revenue}
              </span>
            </span>
          }
          action={<Pill tone="success">+29% vs last period</Pill>}
        />
        <div style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="recovered" stroke="#00d4ff" strokeWidth={2} dot={false}
                    activeDot={{ r: 4, fill: '#00d4ff', stroke: '#06060d', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Campaigns + Recovery Sources */}
      <div className="grid grid-cols-[1fr_380px] gap-5 mb-5">
        <Card>
          <CardHeader label="Top High-Performing Campaigns" />
          <div className="space-y-3">
            {TOP_CAMPAIGNS.map((c, i) => {
              const convRate = Math.round((c.converted / c.enrolled) * 100)
              const colorMap: Record<Tone, string> = { accent:'#00d4ff', violet:'#a78bfa', success:'#3ddc97', warn:'#ffaa00', danger:'#ff4d6a' }
              const color = colorMap[c.tone]
              return (
                <div
                  key={c.name}
                  className="p-4 rounded-[12px]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tokens.borderSubtle}` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] font-semibold metric-num"
                        style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{c.name}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: tokens.textMuted }}>{c.trigger}</div>
                      </div>
                    </div>
                    <Pill tone="success">{c.trend}</Pill>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: 'Enrolled',  value: String(c.enrolled),               color: tokens.textPrimary },
                      { label: 'Converted', value: `${c.converted} (${convRate}%)`,  color },
                      { label: 'Revenue',   value: `$${c.revenue.toLocaleString()}`, color: '#3ddc97' },
                    ].map(({ label, value, color: vColor }) => (
                      <div
                        key={label}
                        className="px-3 py-2 rounded-[8px]"
                        style={{ background: 'rgba(255,255,255,0.025)' }}
                      >
                        <SectionLabel className="!text-[9.5px] mb-1">{label}</SectionLabel>
                        <div className="metric-num text-[13px]" style={{ color: vColor }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={convRate} color={color} height={3} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader label="Top Recovery Sources" />
          <div className="space-y-4">
            {data.sources.map(({ label, pct, color, amount }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}aa` }} />
                    <span className="text-[12.5px]" style={{ color: tokens.textSecondary }}>{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="metric-num text-[12px]" style={{ color }}>${amount.toLocaleString()}</span>
                    <span className="text-[10.5px] w-7 text-right" style={{ color: tokens.textMuted }}>{pct}%</span>
                  </div>
                </div>
                <ProgressBar value={pct} color={color} height={2} />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.borderSubtle}` }}>
            <SectionLabel className="mb-4">Customers Recovered / Period</SectionLabel>
            <div style={{ height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={14}>
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="customers" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Segment Performance */}
      <Card>
        <CardHeader label="Segment Performance" />
        <div className="grid grid-cols-4 gap-4">
          {SEGMENT_PERFORMANCE.map(({ label, rate, color, revenue }) => (
            <div
              key={label}
              className="p-4 rounded-[12px]"
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tokens.borderSubtle}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}aa` }} />
                <span className="text-[11.5px] font-medium" style={{ color: tokens.textSecondary }}>{label}</span>
              </div>
              <div className="metric-num text-[28px] leading-none tracking-tight mb-1" style={{ color }}>{rate}%</div>
              <div className="text-[10.5px] mb-3" style={{ color: tokens.textMuted }}>conversion rate</div>
              <ProgressBar value={rate} color={color} height={3} />
              <div className="mt-3 metric-num text-[12.5px]" style={{ color: '#3ddc97' }}>
                ${revenue.toLocaleString()}
              </div>
              <div className="text-[10.5px] mt-0.5" style={{ color: tokens.textMuted }}>recovered</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2 mt-5">
        <span className="w-1 h-1 rounded-full" style={{ background: tokens.textMuted }} />
        <span className="text-[11.5px]" style={{ color: tokens.textMuted }}>
          Connect Shopify and Klaviyo to populate with live recovery performance.
        </span>
      </div>
    </div>
  )
}
