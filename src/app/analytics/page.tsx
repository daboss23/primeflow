'use client'

import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const REVENUE_TREND = [
  { month: 'Nov', recovered: 4200,  customers: 9  },
  { month: 'Dec', recovered: 6800,  customers: 14 },
  { month: 'Jan', recovered: 5400,  customers: 11 },
  { month: 'Feb', recovered: 9100,  customers: 19 },
  { month: 'Mar', recovered: 11600, customers: 24 },
  { month: 'Apr', recovered: 14200, customers: 31 },
  { month: 'May', recovered: 18400, customers: 38 },
]

const TOP_CAMPAIGNS = [
  { name: 'Abandoned Cart Recovery', trigger: 'Abandoned Cart', enrolled: 142, converted: 31, revenue: 18400, color: '#ff6b6b', trend: '+12%' },
  { name: 'VIP At-Risk Retention',   trigger: 'VIP at Risk',    enrolled: 17,  converted: 9,  revenue: 8940,  color: '#f59e0b', trend: '+28%' },
  { name: 'Dormant Win-Back',        trigger: 'Dormant Buyer',  enrolled: 204, converted: 27, revenue: 6210,  color: '#a78bfa', trend: '+7%'  },
]

const SEGMENT_PERFORMANCE = [
  { label: 'VIP Customers',   rate: 74, color: '#f59e0b', revenue: 12400 },
  { label: 'Repeat Buyers',   rate: 58, color: '#00d4ff', revenue: 9800  },
  { label: 'One-time Buyers', rate: 31, color: '#a78bfa', revenue: 4200  },
  { label: 'Lapsed (90d+)',   rate: 18, color: '#ff6b6b', revenue: 2100  },
]

const RECOVERY_SOURCES = [
  { label: 'Abandoned Cart',   pct: 41, color: '#ff6b6b', amount: 18400 },
  { label: 'VIP Retention',    pct: 28, color: '#f59e0b', amount: 8940  },
  { label: 'Dormant Win-Back', pct: 18, color: '#a78bfa', amount: 6210  },
  { label: 'Failed Payment',   pct: 9,  color: '#ff8c00', amount: 3140  },
  { label: 'Replenishment',    pct: 4,  color: '#00d4ff', amount: 2870  },
]

const KPIS = [
  { label: 'Recovered Revenue',     value: '$49,560', sub: 'across all active workflows',              color: '#00e676' },
  { label: 'Customers Recovered',   value: '108',     sub: 'converted this period',                   color: '#00d4ff' },
  { label: 'Avg Conversion Rate',   value: '23.4%',   sub: 'across all campaigns',                    color: '#a78bfa' },
  { label: 'Workflow Performance',  value: '68%',     sub: 'avg success rate across 4 workflows',     color: '#f59e0b' },
]

const RANGES = ['This Month', 'Last 30 Days', 'Quarter', 'Custom Range']

function DateRangeSelector() {
  const [active, setActive] = useState('This Month')
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {RANGES.map((r) => (
        <button key={r} onClick={() => setActive(r)}
          className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap"
          style={active === r ? {
            background: 'rgba(0,212,255,0.1)',
            color: '#00d4ff',
            border: '1px solid rgba(0,212,255,0.2)',
          } : {
            color: 'rgba(255,255,255,0.32)',
            border: '1px solid transparent',
          }}>
          {r}
        </button>
      ))}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3.5 py-2.5"
      style={{ background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <div className="text-[10px] font-semibold tracking-wider uppercase mb-1.5"
        style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-[12px] font-semibold" style={{ color: p.color }}>
            {p.dataKey === 'recovered' ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="flex-1 overflow-y-auto h-full" style={{ background: '#070714' }}>
      <div className="px-8 py-9">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-[3px] h-8 rounded-full flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom, #7c3aed, #00d4ff)' }} />
              <h1 className="text-[26px] font-bold tracking-tight text-white">Analytics</h1>
            </div>
            <p className="text-[12px] ml-[18px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Recovery performance overview · This month
            </p>
          </div>
          <DateRangeSelector />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {KPIS.map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
                style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</div>
              <div className="text-[32px] font-bold tracking-tight text-white mb-1"
                style={{ fontFamily: 'var(--font-jetbrains)', color }}>{value}</div>
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue Trend */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-1"
                style={{ color: 'rgba(255,255,255,0.28)' }}>Revenue Recovered Over Time</div>
              <div className="text-[22px] font-bold text-white"
                style={{ fontFamily: 'var(--font-jetbrains)' }}>$49,560</div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
              style={{ background: 'rgba(0,230,118,0.07)', border: '1px solid rgba(0,230,118,0.15)' }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
                <path d="M2 12l4-5 3 3 5-7" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[11px] font-semibold" style={{ color: '#00e676' }}>+29% vs last period</span>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="recovered" stroke="#00d4ff" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: '#00d4ff', stroke: '#070714', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Campaigns + Recovery Sources */}
        <div className="grid grid-cols-[1fr_380px] gap-5 mb-6">
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.28)' }}>Top 3 High-Performing Campaigns</div>
            <div className="space-y-3">
              {TOP_CAMPAIGNS.map((c, i) => {
                const convRate = Math.round((c.converted / c.enrolled) * 100)
                return (
                  <div key={c.name} className="p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{ background: `${c.color}15`, color: c.color }}>{i + 1}</div>
                        <div>
                          <div className="text-[13px] font-semibold text-white">{c.name}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.trigger}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(0,230,118,0.07)', border: '1px solid rgba(0,230,118,0.12)' }}>
                        <span className="text-[11px] font-semibold" style={{ color: '#00e676' }}>{c.trend}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Enrolled',  value: String(c.enrolled),                       color: 'rgba(255,255,255,0.65)' },
                        { label: 'Converted', value: `${c.converted} (${convRate}%)`,          color: c.color                  },
                        { label: 'Revenue',   value: `$${c.revenue.toLocaleString()}`,         color: '#00e676'                },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="text-[9px] font-semibold tracking-wider uppercase mb-1"
                            style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
                          <div className="text-[13px] font-bold" style={{ color, fontFamily: 'var(--font-jetbrains)' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${convRate}%`, background: `linear-gradient(90deg, ${c.color}66, ${c.color})` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-5"
              style={{ color: 'rgba(255,255,255,0.28)' }}>Top Recovery Sources</div>
            <div className="space-y-4">
              {RECOVERY_SOURCES.map(({ label, pct, color, amount }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: color, boxShadow: `0 0 5px ${color}99` }} />
                      <span className="text-[12px] text-white/65">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold" style={{ color, fontFamily: 'var(--font-jetbrains)' }}>
                        ${amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] w-7 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full score-bar-fill"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}55, ${color})` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-4"
                style={{ color: 'rgba(255,255,255,0.28)' }}>Customers Recovered / Month</div>
              <div style={{ height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_TREND} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={14}>
                    <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="customers" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Performance */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-5"
            style={{ color: 'rgba(255,255,255,0.28)' }}>Segment Performance</div>
          <div className="grid grid-cols-4 gap-4">
            {SEGMENT_PERFORMANCE.map(({ label, rate, color, revenue }) => (
              <div key={label} className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 6px ${color}99` }} />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                </div>
                <div className="text-[28px] font-bold mb-0.5" style={{ color, fontFamily: 'var(--font-jetbrains)' }}>{rate}%</div>
                <div className="text-[10px] mb-2.5" style={{ color: 'rgba(255,255,255,0.28)' }}>conversion rate</div>
                <div className="h-[3px] rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full score-bar-fill"
                    style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${color}55, ${color})` }} />
                </div>
                <div className="text-[12px] font-semibold" style={{ color: '#00e676', fontFamily: 'var(--font-jetbrains)' }}>
                  ${revenue.toLocaleString()}
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>recovered</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-5">
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Connect Shopify and Klaviyo to populate with live recovery performance
          </span>
        </div>

      </div>
    </div>
  )
}
EOF