'use client'

// FILE: src/components/customers/CustomerListView.tsx

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'

interface Props {
  initialBand?: HealthBand | null
  initialState?: CustomerState | null
}

const HEALTH_BANDS = [
  { key: 'all',    label: 'All',      color: 'rgba(255,255,255,0.5)' },
  { key: 'red',    label: 'Critical', color: '#ff4060' },
  { key: 'yellow', label: 'Watch',    color: '#f59e0b' },
  { key: 'green',  label: 'Healthy',  color: '#00e676' },
] as const

const STATE_OPTIONS = [
  { key: 'all',                 label: 'All States',           color: '' },
  { key: 'abandoned_cart',      label: 'Abandoned Cart',       color: '#ff4d4d' },
  { key: 'failed_payment',      label: 'Failed Payment',       color: '#ff8c00' },
  { key: 'dormant_buyer',       label: 'Dormant Buyer',        color: '#a78bfa' },
  { key: 'repeat_at_risk',      label: 'VIP at Risk',          color: '#f59e0b' },
  { key: 'replenishment',       label: 'Replenishment',        color: '#00d4ff' },
  { key: 'engaged_unconverted', label: 'Unconverted',          color: '#8b5cf6' },
]

const STATE_COLORS: Record<string, string> = {
  abandoned_cart:      '#ff4d4d',
  failed_payment:      '#ff8c00',
  dormant_buyer:       '#a78bfa',
  repeat_at_risk:      '#f59e0b',
  replenishment:       '#00d4ff',
  engaged_unconverted: '#8b5cf6',
}

const STATE_LABELS: Record<string, string> = {
  abandoned_cart:      'Abandoned Cart',
  failed_payment:      'Failed Payment',
  dormant_buyer:       'Dormant',
  repeat_at_risk:      'VIP At Risk',
  replenishment:       'Replenishment',
  engaged_unconverted: 'Unconverted',
}

const HEALTH_COLORS: Record<string, string> = {
  red:    '#ff4060',
  yellow: '#f59e0b',
  green:  '#00e676',
}

const HEALTH_LABELS: Record<string, string> = {
  red:    'Critical',
  yellow: 'Fair',
  green:  'Good',
}

const ACTION_CFG: Record<string, { label: string; color: string }> = {
  abandoned_cart:      { label: 'Recover Cart', color: '#ff4d4d' },
  failed_payment:      { label: 'Fix Payment',  color: '#ff8c00' },
  dormant_buyer:       { label: 'Win-Back',     color: '#a78bfa' },
  repeat_at_risk:      { label: 'VIP Outreach', color: '#f59e0b' },
  replenishment:       { label: 'Replenish',    color: '#00d4ff' },
  engaged_unconverted: { label: 'Convert Now',  color: '#8b5cf6' },
}

const GRID = '1.6fr 0.9fr 0.8fr 0.75fr 0.55fr 0.8fr 0.85fr 0.85fr'

function daysSince(iso: string | null): string {
  if (!iso) return 'Never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

function dayGap(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString()}`
}

function fullName(f: string | null, l: string | null) {
  return [f, l].filter(Boolean).join(' ') || 'Unknown'
}

function inits(f: string | null, l: string | null) {
  return [(f ?? '')[0], (l ?? '')[0]].filter(Boolean).join('').toUpperCase() || '?'
}

export function CustomerListView({ initialBand, initialState }: Props) {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerWithHealth[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [band, setBand]           = useState<string>(initialBand ?? 'all')
  const [state, setState]         = useState<string>(initialState ?? 'all')
  const [hovered, setHovered]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (band !== 'all') p.set('band', band)
      if (state !== 'all') p.set('state', state)
      const res = await fetch(`/api/customers?${p}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch { setCustomers([]) }
    finally { setLoading(false) }
  }, [band, state])

  useEffect(() => { load() }, [load])

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return fullName(c.first_name, c.last_name).toLowerCase().includes(q) ||
           (c.email ?? '').toLowerCase().includes(q)
  })

  const criticalCount = customers.filter(c => c.health_band === 'red').length
  const watchCount    = customers.filter(c => c.health_band === 'yellow').length

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#070714' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Title + search row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-1 h-5 rounded-full bg-[#00d4ff]" />
              <h1 className="text-[20px] font-bold text-white tracking-tight">Customer Intelligence</h1>
            </div>
            <p className="text-[11px] ml-3.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
              {customers.length} customers tracked
              {criticalCount > 0 && <> · <span style={{ color: '#ff4060' }}>{criticalCount} critical</span></>}
              {watchCount > 0    && <> · <span style={{ color: '#f59e0b' }}>{watchCount} on watchlist</span></>}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="11" height="11" fill="none" viewBox="0 0 16 16"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-lg text-[11px] outline-none w-48 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
            />
          </div>
        </div>

        {/* ── Filter tabs — one clean row ── */}
        <div className="flex items-center gap-0">

          {/* Health bands */}
          {HEALTH_BANDS.map((b) => (
            <button key={b.key} onClick={() => setBand(b.key)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-medium transition-all border-b-2 whitespace-nowrap"
              style={band === b.key
                ? { color: b.key === 'all' ? 'white' : b.color, borderBottomColor: b.key === 'all' ? 'rgba(255,255,255,0.5)' : b.color }
                : { color: 'rgba(255,255,255,0.3)', borderBottomColor: 'transparent' }
              }
            >
              {b.key !== 'all' && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: b.color, boxShadow: band === b.key ? `0 0 5px ${b.color}` : undefined }} />
              )}
              {b.label}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-4 mx-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* State tabs — all visible */}
          {STATE_OPTIONS.map((s) => (
            <button key={s.key} onClick={() => setState(s.key)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-all border-b-2 whitespace-nowrap"
              style={state === s.key
                ? { color: s.key === 'all' ? 'rgba(255,255,255,0.8)' : s.color, borderBottomColor: s.key === 'all' ? 'rgba(255,255,255,0.4)' : s.color }
                : { color: 'rgba(255,255,255,0.28)', borderBottomColor: 'transparent' }
              }
            >
              {s.key !== 'all' && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: s.color, boxShadow: state === s.key ? `0 0 5px ${s.color}` : undefined }} />
              )}
              {s.label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Clear */}
          {(band !== 'all' || state !== 'all' || search) && (
            <button onClick={() => { setBand('all'); setState('all'); setSearch('') }}
              className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:bg-white/[0.04] flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6">

          {/* Column headers */}
          <div className="grid py-3 sticky top-0 z-10"
            style={{ gridTemplateColumns: GRID, background: '#070714', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Customer', 'State', 'Health', 'Score', 'Opp.', 'Spend', 'Last Purchase', 'Action'].map((h) => (
              <span key={h} className="text-[9px] font-semibold tracking-[0.13em] uppercase"
                style={{ color: 'rgba(255,255,255,0.22)' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-16 text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>No customers match your filters</div>
          ) : filtered.map((c, i) => {
            const name   = fullName(c.first_name, c.last_name)
            const ini    = inits(c.first_name, c.last_name)
            const gap    = dayGap(c.last_purchase_at)
            const hc     = HEALTH_COLORS[c.health_band] ?? 'rgba(255,255,255,0.3)'
            const isCrit = c.health_band === 'red'
            const isWat  = c.health_band === 'yellow'
            const action = ACTION_CFG[c.state]
            const isHov  = hovered === c.customer_id

            return (
              <div key={c.customer_id}
                className="grid cursor-pointer transition-all"
                style={{
                  gridTemplateColumns: GRID,
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  background: isHov ? 'rgba(255,255,255,0.018)' : 'transparent',
                  borderLeft: isCrit ? '2px solid rgba(255,64,96,0.6)' : isWat ? '2px solid rgba(245,158,11,0.5)' : '2px solid transparent',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                  paddingLeft: '2px',
                }}
                onMouseEnter={() => setHovered(c.customer_id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => router.push(`/customers/${c.customer_id}`)}
              >
                {/* Customer */}
                <div className="flex items-center gap-2.5 pr-4 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: isCrit ? 'linear-gradient(135deg,#8b1a2e,#c0253a)' : isWat ? 'linear-gradient(135deg,#78450a,#b8690f)' : 'linear-gradient(135deg,#0d3320,#0e5c35)' }}>
                    {ini}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.88)' }}>{name}</div>
                    <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>{c.email}</div>
                  </div>
                </div>

                {/* State */}
                <div className="flex items-center">
                  {c.state ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ color: STATE_COLORS[c.state] ?? 'white', background: `${STATE_COLORS[c.state] ?? '#fff'}14`, border: `1px solid ${STATE_COLORS[c.state] ?? '#fff'}20` }}>
                      {STATE_LABELS[c.state] ?? c.state}
                    </span>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>healthy</span>
                  )}
                </div>

                {/* Health */}
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: hc, boxShadow: `0 0 4px ${hc}88` }} />
                  <span className="text-[11px] font-medium" style={{ color: hc }}>
                    {HEALTH_LABELS[c.health_band] ?? c.health_band}
                  </span>
                </div>

                {/* Score bar */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${c.health_score}%`, background: hc }} />
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.health_score}</span>
                </div>

                {/* Opp */}
                <div className="flex items-center">
                  <span className="text-[13px] font-bold" style={{ color: '#00d4ff' }}>{c.opportunity_score}</span>
                </div>

                {/* Spend */}
                <div className="flex items-center">
                  <div>
                    <div className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{fmt(c.total_spend)}</div>
                    <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.22)' }}>{c.total_orders} orders</div>
                  </div>
                </div>

                {/* Last purchase */}
                <div className="flex items-center">
                  <div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{daysSince(c.last_purchase_at)}</div>
                    {gap !== null && gap > 30 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg width="8" height="8" fill="none" viewBox="0 0 16 16">
                          <circle cx="8" cy="8" r="6" stroke="#f59e0b" strokeWidth="1.5"/>
                          <path d="M8 5v3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[9px]" style={{ color: '#f59e0b' }}>{gap}d gap</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pr-2">
                  {action ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold"
                      style={{ color: action.color, background: `${action.color}12`, border: `1px solid ${action.color}20` }}>
                      {action.label}
                    </span>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>
                  )}
                  <svg width="10" height="10" fill="none" viewBox="0 0 16 16"
                    style={{ color: 'rgba(255,255,255,0.18)', opacity: isHov ? 1 : 0, transition: 'opacity 0.12s', flexShrink: 0 }}>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>

              </div>
            )
          })}

          <div className="py-3 text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {filtered.length} of {customers.length} customers
          </div>
        </div>
      </div>

    </div>
  )
}
