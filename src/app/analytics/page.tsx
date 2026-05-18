'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  PageHeader, Card, CardHeader, SectionLabel, Pill, ProgressBar, tokens,
} from '@/components/ui'

// ─── Shared filter types (export-ready for API integration) ──────────────────
//
// To connect real data: replace resolveAnalyticsData() with an async fetch
// that accepts AnalyticsFilter and returns AnalyticsData. The component wiring
// (useMemo → filter → data) does not need to change.

export type DateRangePreset = 'This Month' | 'Last 30 Days' | 'Quarter' | 'Custom Range'

export type AnalyticsFilter = {
  preset:    DateRangePreset
  startDate: string   // ISO YYYY-MM-DD — always set, even for presets
  endDate:   string
}

type Tone = 'accent' | 'violet' | 'success' | 'warn' | 'danger'

export type TrendPoint    = { month: string; recovered: number; customers: number }
export type SourceMetric  = { label: string; key: string; pct: number; color: string; amount: number }
export type WorkflowMetric = {
  name: string; trigger: string; enrolled: number; converted: number
  revenue: number; tone: Tone; trend: string; status: 'performing' | 'watch'
}
export type SegmentMetric = { label: string; rate: number; color: string; revenue: number; delta: string }

export type AnalyticsData = {
  kpis: {
    revenueRaw:     number
    customersRaw:   number
    rateRaw:        number
    successRateRaw: number
    revenue:        string
    customers:      string
    rate:           string
    successRate:    string
  }
  trend:     TrendPoint[]
  sources:   SourceMetric[]
  workflows: WorkflowMetric[]
  segments:  SegmentMetric[]
  deltas:    { revenue: string; customers: string; rate: string; success: string }
}

// ─── Preset date helpers ──────────────────────────────────────────────────────

function isoDate(d: Date): string { return d.toISOString().slice(0, 10) }

function presetDates(preset: DateRangePreset): { start: string; end: string } {
  const today = new Date()
  const sub = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return d }
  switch (preset) {
    case 'This Month':
      return { start: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)), end: isoDate(today) }
    case 'Last 30 Days':
      return { start: isoDate(sub(30)), end: isoDate(today) }
    case 'Quarter':
      return { start: isoDate(new Date(today.getFullYear(), today.getMonth() - 2, 1)), end: isoDate(today) }
    default:
      return { start: '', end: '' }
  }
}

// ─── Data resolution ──────────────────────────────────────────────────────────
//
// Single function that accepts an AnalyticsFilter and returns AnalyticsData.
// Preset ranges use known reference values; Custom Range computes from date span.
// Replace this function body with an API call to connect real data.

const SOURCE_TEMPLATE: Omit<SourceMetric, 'amount'>[] = [
  { label: 'Abandoned Cart',   key: 'cart',      pct: 41, color: '#ff4d6a' },
  { label: 'VIP Retention',    key: 'vip',       pct: 28, color: '#ffaa00' },
  { label: 'Dormant Win-Back', key: 'dormant',   pct: 18, color: '#a78bfa' },
  { label: 'Failed Payment',   key: 'payment',   pct:  9, color: '#ff7a3d' },
  { label: 'Replenishment',    key: 'replenish', pct:  4, color: '#00d4ff' },
]

const WORKFLOW_TEMPLATE: Omit<WorkflowMetric, 'enrolled' | 'converted' | 'revenue' | 'trend'>[] = [
  { name: 'Abandoned Cart Recovery', trigger: 'Abandoned Cart', tone: 'danger',  status: 'performing' },
  { name: 'VIP At-Risk Retention',   trigger: 'VIP at Risk',    tone: 'warn',    status: 'performing' },
  { name: 'Dormant Win-Back',        trigger: 'Dormant Buyer',  tone: 'violet',  status: 'watch'      },
]

// Deterministic hash so the same dates always produce the same numbers
function strHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${Math.round(n / 100) * 100 >= 10_000
    ? (n / 1_000).toFixed(0) + 'k'
    : n.toLocaleString()}`
  return `$${n}`
}

function fmtCurrencyExact(n: number): string {
  return `$${n.toLocaleString()}`
}

function daysBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000) + 1)
}

function buildTrend(start: string, end: string, totalRevenue: number, hash: number): TrendPoint[] {
  const days = daysBetween(start, end)
  const bucketCount = days <= 14 ? days : days <= 60 ? Math.round(days / 7) : Math.min(12, Math.round(days / 30))
  const startMs = new Date(start).getTime()
  const endMs   = new Date(end).getTime()
  const granularity = days <= 14 ? 'day' : days <= 60 ? 'week' : 'month'

  return Array.from({ length: bucketCount }, (_, i) => {
    const bucketDate = new Date(startMs + ((i + 0.5) / bucketCount) * (endMs - startMs))
    const label = granularity === 'day'
      ? `${bucketDate.getMonth() + 1}/${bucketDate.getDate()}`
      : granularity === 'week' ? `W${i + 1}`
      : bucketDate.toLocaleDateString('en-US', { month: 'short' })
    // Progressive growth curve with deterministic variance per bucket
    const growth  = 0.6 + (i / Math.max(1, bucketCount - 1)) * 0.8
    const noise   = 0.88 + ((strHash(`${hash}${i}`) % 24) / 100)
    const recovered = Math.round((totalRevenue / bucketCount) * growth * noise)
    return { month: label, recovered, customers: Math.max(1, Math.round(recovered / 500)) }
  })
}

function buildSources(totalRevenue: number, hash: number): SourceMetric[] {
  // Slight pct variance (±3pp) per date range, normalised to 100
  const rawPcts = SOURCE_TEMPLATE.map((s, i) => ({
    ...s,
    pct: Math.max(2, s.pct + ((strHash(`${hash}src${i}`) % 7) - 3)),
  }))
  const total = rawPcts.reduce((a, b) => a + b.pct, 0)
  return rawPcts.map(s => ({
    ...s,
    pct:    Math.round((s.pct / total) * 100),
    amount: Math.round(totalRevenue * (s.pct / total)),
  }))
}

function buildWorkflows(totalRevenue: number, days: number, hash: number): WorkflowMetric[] {
  const scale = days / 30
  const weights = [0.52, 0.28, 0.20]
  return WORKFLOW_TEMPLATE.map((t, i) => {
    const revenue   = Math.round(totalRevenue * weights[i])
    const enrolled  = Math.round((142 * scale * weights[i] / weights[0]) * (0.9 + ((strHash(`${hash}wf${i}`) % 20) / 100)))
    const converted = Math.round(enrolled * (0.18 + ((strHash(`${hash}cv${i}`) % 15) / 100)))
    const trendPct  = 5 + (strHash(`${hash}tr${i}`) % 28)
    const trend     = t.status === 'performing' ? `+${trendPct}%` : `+${Math.max(2, trendPct - 10)}%`
    return { ...t, revenue, enrolled, converted, trend }
  })
}

function buildSegments(totalRevenue: number, hash: number): SegmentMetric[] {
  const base = [
    { label: 'VIP Customers',   color: '#ffaa00', rateBase: 74, revenueShare: 0.42 },
    { label: 'Repeat Buyers',   color: '#00d4ff', rateBase: 58, revenueShare: 0.33 },
    { label: 'One-time Buyers', color: '#a78bfa', rateBase: 31, revenueShare: 0.17 },
    { label: 'Lapsed (90d+)',   color: '#ff4d6a', rateBase: 18, revenueShare: 0.08 },
  ]
  return base.map((seg, i) => {
    const rate    = Math.max(5, Math.min(90, seg.rateBase + ((strHash(`${hash}seg${i}`) % 10) - 5)))
    const deltaPP = ((strHash(`${hash}dlt${i}`) % 13) - 6)
    const delta   = `${deltaPP >= 0 ? '+' : ''}${deltaPP}%`
    return { ...seg, rate, revenue: Math.round(totalRevenue * seg.revenueShare), delta }
  })
}

// Reference values for preset ranges (known, stable numbers)
const PRESET_REVENUE: Record<string, number> = {
  'This Month':   18400,
  'Last 30 Days': 22300,
  'Quarter':      49560,
}

const PRESET_RATES: Record<string, { rate: number; successRate: number }> = {
  'This Month':   { rate: 26.8, successRate: 71 },
  'Last 30 Days': { rate: 24.1, successRate: 68 },
  'Quarter':      { rate: 23.4, successRate: 68 },
}

const PRESET_DELTAS: Record<string, AnalyticsData['deltas']> = {
  'This Month':   { revenue: '+29%', customers: '+18%', rate: '+2.4pp', success: '+5%' },
  'Last 30 Days': { revenue: '+24%', customers: '+14%', rate: '+1.8pp', success: '+3%' },
  'Quarter':      { revenue: '+41%', customers: '+31%', rate: '+3.1pp', success: '+7%' },
}

export function resolveAnalyticsData(filter: AnalyticsFilter): AnalyticsData {
  const { preset, startDate, endDate } = filter

  // For custom ranges with incomplete dates, fall back to This Month
  if (preset === 'Custom Range' && (!startDate || !endDate)) {
    const d = presetDates('This Month')
    return resolveAnalyticsData({ preset: 'This Month', startDate: d.start, endDate: d.end })
  }

  const start = preset === 'Custom Range' ? startDate : presetDates(preset).start || startDate
  const end   = preset === 'Custom Range' ? endDate   : presetDates(preset).end   || endDate

  const days = daysBetween(start, end)
  const hash = strHash(start + end)

  // Revenue: use known values for presets; compute for custom
  const revenueRaw = preset !== 'Custom Range'
    ? PRESET_REVENUE[preset]
    : Math.round(days * 620 * (0.88 + (hash % 24) / 100))    // ~$620/day baseline

  const rateBase        = preset !== 'Custom Range' ? PRESET_RATES[preset].rate        : 22 + (hash % 10) * 0.5
  const successRateBase = preset !== 'Custom Range' ? PRESET_RATES[preset].successRate : 62 + (hash % 12)

  const customersRaw  = Math.max(1, Math.round(revenueRaw / 490))
  const rateRaw       = Math.round(rateBase * 10) / 10
  const successRateRaw = Math.round(successRateBase)

  const deltas: AnalyticsData['deltas'] = preset !== 'Custom Range'
    ? PRESET_DELTAS[preset]
    : {
        revenue:   `${revenueRaw > 18400 ? '+' : ''}${Math.round(((revenueRaw - 18400) / 18400) * 100)}%`,
        customers: `${customersRaw > 38 ? '+' : ''}${Math.round(((customersRaw - 38) / 38) * 100)}%`,
        rate:      `${rateRaw > 26.8 ? '+' : ''}${(rateRaw - 26.8).toFixed(1)}pp`,
        success:   `${successRateRaw > 71 ? '+' : ''}${successRateRaw - 71}%`,
      }

  return {
    kpis: {
      revenueRaw,
      customersRaw,
      rateRaw,
      successRateRaw,
      revenue:     fmtCurrencyExact(revenueRaw),
      customers:   String(customersRaw),
      rate:        `${rateRaw.toFixed(1)}%`,
      successRate: `${successRateRaw}%`,
    },
    trend:     buildTrend(start, end, revenueRaw, hash),
    sources:   buildSources(revenueRaw, hash),
    workflows: buildWorkflows(revenueRaw, days, hash),
    segments:  buildSegments(revenueRaw, hash),
    deltas,
  }
}

// ─── Static config ────────────────────────────────────────────────────────────

const RANGES: DateRangePreset[] = ['This Month', 'Last 30 Days', 'Quarter', 'Custom Range']

const TONE_COLORS: Record<Tone, string> = {
  accent: '#00d4ff', violet: '#a78bfa', success: '#3ddc97', warn: '#ffaa00', danger: '#ff4d6a',
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

const sv = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  cart:     <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><path d="M1 1.5h2l2 7h7l1.5-4.5H4.5"/><circle cx="6" cy="13" r="1"/><circle cx="11" cy="13" r="1"/></svg>,
  vip:      <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><path d="M8 2l1.4 4.2H14l-3.5 2.5 1.3 4.1L8 10.3l-3.8 2.5 1.3-4.1L2 6.2h4.6z"/></svg>,
  dormant:  <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><circle cx="7" cy="5.5" r="2.5"/><path d="M2.5 14c0-2.6 2-4.2 4.5-4.2"/><path d="M11 9h3M12 11h2"/></svg>,
  payment:  <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><rect x="1.5" y="4" width="13" height="9" rx="1.5"/><path d="M1.5 7h13"/><path d="M10 10.5l1.5 1.5M11.5 10.5L10 12"/></svg>,
  replenish:<svg width="13" height="13" viewBox="0 0 16 16" {...sv}><path d="M13.5 4A6 6 0 1 1 8 2"/><path d="M13.5 1.5v2.5H11"/></svg>,
}

const KPI_ICONS: Record<string, React.ReactNode> = {
  revenue:   <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><path d="M2 11l5-5 3 3 4-5"/><path d="M11 4h3v3"/></svg>,
  customers: <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2"/></svg>,
  rate:      <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><circle cx="8" cy="8" r="5.5"/><path d="M5.5 8l2 2 3-3"/></svg>,
  success:   <svg width="13" height="13" viewBox="0 0 16 16" {...sv}><path d="M1 8.5h2.5l1.5-4.5 2.5 9 2-5.5 1 1H15"/></svg>,
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
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
  // Single shared filter — every analytics module derives from this
  const [filter, setFilter] = useState<AnalyticsFilter>(() => {
    const { start, end } = presetDates('This Month')
    return { preset: 'This Month', startDate: start, endDate: end }
  })

  // Popover UI state — local only, committed to filter on Apply
  const [panelOpen,  setPanelOpen]  = useState(false)
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd,   setDraftEnd]   = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  // All analytics modules derive from one resolved data object
  const data = useMemo<AnalyticsData>(() => resolveAnalyticsData(filter), [filter])

  // Click-outside / Escape to close popover
  useEffect(() => {
    if (!panelOpen) return
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPanelOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setPanelOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [panelOpen])

  function selectPreset(preset: DateRangePreset) {
    if (preset === 'Custom Range') {
      setDraftStart(filter.preset === 'Custom Range' ? filter.startDate : '')
      setDraftEnd(filter.preset === 'Custom Range' ? filter.endDate : '')
      setPanelOpen(true)
      // Keep current filter active (don't wipe data) until Apply
      if (filter.preset !== 'Custom Range') {
        setFilter((f: AnalyticsFilter) => ({ ...f, preset: 'Custom Range' as DateRangePreset }))
      }
    } else {
      const { start, end } = presetDates(preset)
      setFilter({ preset, startDate: start, endDate: end })
      setPanelOpen(false)
    }
  }

  function applyDates() {
    setFilter({ preset: 'Custom Range', startDate: draftStart, endDate: draftEnd })
    setPanelOpen(false)
  }

  function clearDates() {
    setDraftStart('')
    setDraftEnd('')
    const { start, end } = presetDates('This Month')
    setFilter({ preset: 'This Month', startDate: start, endDate: end })
    setPanelOpen(false)
  }

  const isCustom     = filter.preset === 'Custom Range'
  const customActive = isCustom && !!filter.startDate && !!filter.endDate

  const periodLabel = customActive
    ? `${filter.startDate} → ${filter.endDate}`
    : filter.preset

  const kpis = [
    { label: 'Recovered Revenue',   value: data.kpis.revenue,     sub: 'across active workflows', color: '#3ddc97', delta: data.deltas.revenue,   icon: 'revenue'   },
    { label: 'Customers Recovered', value: data.kpis.customers,   sub: 'converted this period',   color: '#00d4ff', delta: data.deltas.customers, icon: 'customers' },
    { label: 'Avg Conversion Rate', value: data.kpis.rate,        sub: 'across all workflows',    color: '#a78bfa', delta: data.deltas.rate,      icon: 'rate'      },
    { label: 'Recovery Success',    value: data.kpis.successRate, sub: 'workflows on target',     color: '#ffaa00', delta: data.deltas.success,   icon: 'success'   },
  ]

  const performingCount = data.workflows.filter((w: WorkflowMetric) => w.status === 'performing').length
  const watchCount      = data.workflows.filter((w: WorkflowMetric) => w.status === 'watch').length
  const topSource       = data.sources[0]

  return (
    <div className="pl-7 pr-8 py-9 w-full relative">
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        subtitle={`Recovery performance · ${periodLabel}`}
        actions={
          <div ref={panelRef} className="relative">
            {/* Range tabs */}
            <div className="flex items-center gap-1 p-1 rounded-[10px]"
              style={{ background: tokens.surface, border: `1px solid ${tokens.borderSubtle}` }}>
              {RANGES.map((r) => {
                const isActive   = filter.preset === r
                const isCustomTab = r === 'Custom Range'
                return (
                  <button key={r} onClick={() => selectPreset(r)}
                    className="h-7 px-3 rounded-[7px] text-[11.5px] font-medium transition-all whitespace-nowrap"
                    style={
                      isActive
                        ? { background: 'rgba(0,212,255,0.10)', color: '#00d4ff', boxShadow: '0 0 0 1px rgba(0,212,255,0.28) inset' }
                        : { color: tokens.textTertiary, background: 'transparent' }
                    }>
                    {isCustomTab && customActive ? `${filter.startDate} → ${filter.endDate}` : r}
                  </button>
                )
              })}
            </div>

            {/* Floating date-range popover */}
            {panelOpen && (
              <div className="absolute right-0 z-50 rounded-[16px] p-7"
                style={{
                  top: 'calc(100% + 10px)',
                  width: 380,
                  background: 'rgba(10,10,20,0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 24px 64px -12px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.06) inset',
                }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <svg width="13" height="13" fill="none" viewBox="0 0 16 16" style={{ color: tokens.accent }}>
                      <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1 6h14M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Custom date range</span>
                  </div>
                  <button onClick={() => setPanelOpen(false)}
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-white/[0.06]"
                    style={{ color: tokens.textMuted }}>
                    <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="eyebrow mb-2" style={{ fontSize: 9.5 }}>Start date</div>
                    <input type="date" value={draftStart} max={draftEnd || undefined}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftStart(e.target.value)}
                      className="mfi" style={{ colorScheme: 'dark', fontSize: 13.5 }} />
                  </div>
                  <div>
                    <div className="eyebrow mb-2" style={{ fontSize: 9.5 }}>End date</div>
                    <input type="date" value={draftEnd} min={draftStart || undefined}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraftEnd(e.target.value)}
                      className="mfi" style={{ colorScheme: 'dark', fontSize: 13.5 }} />
                  </div>
                </div>

                {draftStart && draftEnd && (
                  <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-[8px]"
                    style={{ background: 'rgba(61,220,151,0.06)', border: '1px solid rgba(61,220,151,0.16)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3ddc97' }} />
                    <span className="text-[12px]" style={{ color: '#3ddc97' }}>
                      {daysBetween(draftStart, draftEnd)} days · {draftStart} → {draftEnd}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={clearDates}
                    className="text-[12px] font-medium px-3 py-2 rounded-[8px] transition-all hover:bg-white/[0.04]"
                    style={{ color: tokens.textMuted }}>Clear</button>
                  <button onClick={applyDates} disabled={!draftStart || !draftEnd}
                    className="px-5 py-2 rounded-[9px] text-[12.5px] font-semibold transition-all disabled:opacity-35"
                    style={{
                      background: draftStart && draftEnd ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.05)',
                      color:      draftStart && draftEnd ? '#00d4ff' : tokens.textMuted,
                      border:     `1px solid ${draftStart && draftEnd ? 'rgba(0,212,255,0.28)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    Apply range →
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Recovery intelligence summary */}
      <div className="flex items-center gap-5 mb-6 px-5 py-3.5 rounded-[12px]"
        style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/workflows" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3ddc97', boxShadow: '0 0 6px rgba(61,220,151,0.7)' }} />
          <span className="text-[12.5px]" style={{ color: tokens.textSecondary }}>
            <span className="font-semibold" style={{ color: tokens.textPrimary }}>{performingCount} workflows</span> above target
          </span>
          <svg width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ color: tokens.textFaint }}>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div className="w-px h-4 flex-shrink-0" style={{ background: tokens.borderSubtle }} />
        {watchCount > 0 && (
          <>
            <Link href="/workflows" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ffaa00', boxShadow: '0 0 6px rgba(255,170,0,0.6)' }} />
              <span className="text-[12.5px]" style={{ color: tokens.textSecondary }}>
                <span className="font-semibold" style={{ color: tokens.textPrimary }}>{watchCount} workflow</span> needs attention — low conversion
              </span>
              <svg width="10" height="10" fill="none" viewBox="0 0 16 16" style={{ color: tokens.textFaint }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
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
            <div className="metric-num text-[32px] leading-none tracking-tight mb-2" style={{ color }}>{value}</div>
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
          action={<Pill tone="success">{data.deltas.revenue} vs prev. period</Pill>}
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
            {data.workflows.map((w: WorkflowMetric, i: number) => {
              const convRate = Math.round((w.converted / Math.max(1, w.enrolled)) * 100)
              const color    = TONE_COLORS[w.tone]
              const isWatch  = w.status === 'watch'
              return (
                <div key={w.name} className="p-5 rounded-[12px]"
                  style={{
                    background: isWatch ? 'rgba(255,170,0,0.04)' : 'rgba(255,255,255,0.030)',
                    border: `1px solid ${isWatch ? 'rgba(255,170,0,0.18)' : tokens.borderSubtle}`,
                  }}>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[12px] font-semibold metric-num"
                        style={{ background: `${color}14`, color, border: `1px solid ${color}28` }}>{i + 1}</div>
                      <div>
                        <div className="text-[14px] font-medium" style={{ color: tokens.textPrimary }}>{w.name}</div>
                        <div className="text-[12px] mt-0.5" style={{ color: tokens.textMuted }}>{w.trigger}</div>
                      </div>
                    </div>
                    {isWatch
                      ? <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ background: 'rgba(255,170,0,0.10)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.22)' }}>
                          Needs attention
                        </span>
                      : <Pill tone="success">{w.trend}</Pill>}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3.5">
                    {[
                      { label: 'Enrolled',  value: String(w.enrolled),               vColor: tokens.textSecondary },
                      { label: 'Converted', value: `${w.converted} (${convRate}%)`,  vColor: color               },
                      { label: 'Revenue',   value: `$${w.revenue.toLocaleString()}`,  vColor: '#3ddc97'           },
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

        <Card>
          <CardHeader label="Recovery by Source" />
          <div className="space-y-4">
            {data.sources.map(({ label, key, pct, color, amount }: SourceMetric) => (
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
          {data.segments.map(({ label, rate, color, revenue, delta }: SegmentMetric) => {
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
                    }}>{delta}</span>
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
