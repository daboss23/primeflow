'use client'

// FILE: src/components/customers/CustomerListView.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'

interface Props {
  initialBand?: HealthBand | null
  initialState?: CustomerState | null
}

// ── 5-level health derived from health_score ──────────────────────────────────

type HealthLevel = 'all' | 'critical' | 'poor' | 'fair' | 'good' | 'excellent'

function getHealthLevel(score: number): HealthLevel {
  if (score <= 20) return 'critical'
  if (score <= 40) return 'poor'
  if (score <= 60) return 'fair'
  if (score <= 80) return 'good'
  return 'excellent'
}

const HEALTH_LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  critical:  { label: 'Critical',  color: '#ff4060' },
  poor:      { label: 'Poor',      color: '#ff8c00' },
  fair:      { label: 'Fair',      color: '#f59e0b' },
  good:      { label: 'Good',      color: '#00d4ff' },
  excellent: { label: 'Excellent', color: '#00e676' },
}

const HEALTH_OPTIONS: Array<{ key: HealthLevel; label: string; color?: string }> = [
  { key: 'all',       label: 'All Health' },
  { key: 'critical',  label: 'Critical',  color: '#ff4060' },
  { key: 'poor',      label: 'Poor',      color: '#ff8c00' },
  { key: 'fair',      label: 'Fair',      color: '#f59e0b' },
  { key: 'good',      label: 'Good',      color: '#00d4ff' },
  { key: 'excellent', label: 'Excellent', color: '#00e676' },
]

// ── State filters ─────────────────────────────────────────────────────────────

const STATE_FILTERS = [
  { key: 'all',                 label: 'All' },
  { key: 'abandoned_cart',      label: 'Abandoned Cart' },
  { key: 'failed_payment',      label: 'Failed Payment' },
  { key: 'dormant_buyer',       label: 'Dormant' },
  { key: 'repeat_at_risk',      label: 'VIP At Risk' },
  { key: 'replenishment',       label: 'Replenishment' },
  { key: 'engaged_unconverted', label: 'Unconverted' },
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

const ACTION_CFG: Record<string, { label: string; color: string }> = {
  abandoned_cart:      { label: 'Recover Cart',      color: '#ff4d4d' },
  failed_payment:      { label: 'Fix Payment',       color: '#ff8c00' },
  dormant_buyer:       { label: 'Win-Back',          color: '#a78bfa' },
  repeat_at_risk:      { label: 'Personal Outreach', color: '#f59e0b' },
  replenishment:       { label: 'Replenish',         color: '#00d4ff' },
  engaged_unconverted: { label: 'Convert Now',       color: '#8b5cf6' },
}

const VIP_STATES = new Set(['repeat_at_risk'])

const GRID = '220px 120px 105px 130px 75px 110px 145px 130px'

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(iso: string | null): string {
  if (!iso) return 'Never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d} days ago`
  const mo = Math.round(d / 30)
  if (d < 365) return `${mo} month${mo > 1 ? 's' : ''} ago`
  const yr = Math.round(d / 365)
  return `about ${yr} year${yr > 1 ? 's' : ''} ago`
}

function dayGap(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function fmt(n: number): string {
  return `$${n.toLocaleString()}`
}

function fullName(f: string | null, l: string | null) {
  return [f, l].filter(Boolean).join(' ') || 'Unknown'
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CustomerListView({ initialBand, initialState }: Props) {
  const router    = useRouter()
  const healthRef = useRef<HTMLDivElement>(null)

  const [customers,  setCustomers]  = useState<CustomerWithHealth[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [state,      setState]      = useState<string>(initialState ?? 'all')
  const [health,     setHealth]     = useState<HealthLevel>('all')
  const [healthOpen, setHealthOpen] = useState(false)
  const [hovered,    setHovered]    = useState<string | null>(null)

  // Fetch — state goes to API; health + search filtered client-side
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (state !== 'all') p.set('state', state)
      const res  = await fetch(`/api/customers?${p}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch { setCustomers([]) }
    finally   { setLoading(false) }
  }, [state])

  useEffect(() => { load() }, [load])

  // Close health dropdown on outside click
  useEffect(() => {
    if (!healthOpen) return
    const fn = (e: MouseEvent) => {
      if (healthRef.current && !healthRef.current.contains(e.target as Node)) setHealthOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [healthOpen])

  // Client-side filtering
  const filtered = customers.filter(c => {
    if (health !== 'all' && getHealthLevel(c.health_score) !== health) return false
    if (!search) return true
    const q = search.toLowerCase()
    return fullName(c.first_name, c.last_name).toLowerCase().includes(q) ||
           (c.email ?? '').toLowerCase().includes(q)
  })

  const criticalCount = customers.filter(c => c.health_band === 'red').length
  const watchCount    = customers.filter(c => c.health_band === 'yellow').length
  const healthLabel   = HEALTH_OPTIONS.find(h => h.key === health)?.label ?? 'All Health'
  const healthColor   = HEALTH_OPTIONS.find(h => h.key === health)?.color
  const hasFilters    = state !== 'all' || health !== 'all' || !!search

  const clearAll = () => { setState('all'); setHealth('all'); setSearch('') }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#070714' }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Title + subtitle inline */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ background: '#00d4ff' }} />
            <h1 className="text-[19px] font-bold text-white tracking-tight">Customer Intelligence</h1>
          </div>
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {customers.length} customers tracked
            {criticalCount > 0 && <> · <span style={{ color: '#ff4060' }}>{criticalCount} critical</span></>}
            {watchCount    > 0 && <> · <span style={{ color: '#f59e0b' }}>{watchCount} on watchlist</span></>}
          </span>
        </div>

        {/* ── State pill row — single clean row across the top ── */}
        <div className="flex items-center gap-1.5 mb-3.5">
          {STATE_FILTERS.map(opt => {
            const active = state === opt.key
            const color  = opt.key === 'all' ? undefined : STATE_COLORS[opt.key]
            return (
              <button
                key={opt.key}
                onClick={() => setState(opt.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap"
                style={active
                  ? {
                      background: color ? `${color}1a` : 'rgba(255,255,255,0.1)',
                      color:      color ?? 'rgba(255,255,255,0.92)',
                      border:     `1px solid ${color ? `${color}45` : 'rgba(255,255,255,0.22)'}`,
                    }
                  : {
                      background: 'transparent',
                      color:      'rgba(255,255,255,0.32)',
                      border:     '1px solid rgba(255,255,255,0.07)',
                    }
                }
              >
                {color && (
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color, opacity: active ? 1 : 0.45 }} />
                )}
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* ── Search (left) + Health dropdown ── */}
        <div className="flex items-center gap-2.5">

          {/* Search */}
          <div className="relative" style={{ width: '260px' }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="11" height="11" fill="none" viewBox="0 0 16 16"
              style={{ color: 'rgba(255,255,255,0.22)' }}>
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-[11px] outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border:     '1px solid rgba(255,255,255,0.07)',
                color:      'rgba(255,255,255,0.65)',
              }}
            />
          </div>

          {/* Health dropdown */}
          <div className="relative" ref={healthRef}>
            <button
              onClick={() => setHealthOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all"
              style={{
                background: healthColor ? `${healthColor}14` : 'rgba(255,255,255,0.035)',
                color:      healthColor ?? 'rgba(255,255,255,0.4)',
                border:     healthColor ? `1px solid ${healthColor}30` : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {healthColor && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: healthColor, boxShadow: `0 0 4px ${healthColor}88` }} />
              )}
              {healthLabel}
              <svg width="9" height="9" fill="none" viewBox="0 0 16 16"
                style={{ transform: healthOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s', color: 'rgba(255,255,255,0.25)' }}>
                <path d="M3 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {healthOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-40 rounded-xl overflow-hidden z-50"
                style={{ background: '#0e0e24', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
                {HEALTH_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setHealth(opt.key); setHealthOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[11px] font-medium text-left transition-all hover:bg-white/[0.04]"
                    style={{ color: health === opt.key ? (opt.color ?? 'rgba(255,255,255,0.9)') : 'rgba(255,255,255,0.38)' }}
                  >
                    {opt.color && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                    )}
                    {opt.label}
                    {health === opt.key && (
                      <svg className="ml-auto" width="9" height="9" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all hover:bg-white/[0.04]"
              style={{ color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6">

          {/* Column headers */}
          <div className="grid py-3 sticky top-0 z-10"
            style={{
              gridTemplateColumns: GRID,
              background:          '#070714',
              borderBottom:        '1px solid rgba(255,255,255,0.05)',
            }}>
            {['Customer', 'State', 'Health', 'Health Score', 'Opp.', 'Spend', 'Last Purchase', 'Action'].map(h => (
              <span key={h} className="text-[9px] font-semibold tracking-[0.13em] uppercase"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>No customers match your filters</div>
          ) : filtered.map((c, i) => {
            const name       = fullName(c.first_name, c.last_name)
            const gap        = dayGap(c.last_purchase_at)
            const hlvl       = getHealthLevel(c.health_score)
            const hcfg       = HEALTH_LEVEL_CONFIG[hlvl]
            const isCrit     = c.health_band === 'red'
            const isWat      = c.health_band === 'yellow'
            const action     = ACTION_CFG[c.state]
            const isVip      = VIP_STATES.has(c.state)
            const isHov      = hovered === c.customer_id
            const stateColor = c.state ? STATE_COLORS[c.state] : undefined

            return (
              <div
                key={c.customer_id}
                className="grid cursor-pointer transition-all"
                style={{
                  gridTemplateColumns: GRID,
                  borderBottom:  i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  background:    isHov ? 'rgba(255,255,255,0.016)' : 'transparent',
                  borderLeft:    isCrit ? '2px solid rgba(255,64,96,0.55)'
                                        : isWat ? '2px solid rgba(245,158,11,0.4)'
                                        : '2px solid transparent',
                  paddingTop:    '12px',
                  paddingBottom: '12px',
                  paddingLeft:   '3px',
                  alignItems:    'center',
                }}
                onMouseEnter={() => setHovered(c.customer_id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => router.push(`/customers/${c.customer_id}`)}
              >

                {/* Customer */}
                <div className="pr-4 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[13px] font-bold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {name}
                    </span>
                    {isVip && (
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="#f59e0b" style={{ flexShrink: 0 }}>
                        <path d="M8 1l1.8 4H14l-3.4 2.6 1.3 4.1L8 9.3l-3.9 2.4 1.3-4.1L2 5h4.2z"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.26)' }}>
                    {c.email}
                  </div>
                </div>

                {/* State pill */}
                <div className="flex items-center">
                  {c.state ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap"
                      style={{
                        color:      stateColor ?? 'white',
                        background: `${stateColor ?? '#fff'}14`,
                        border:     `1px solid ${stateColor ?? '#fff'}28`,
                      }}>
                      {STATE_LABELS[c.state] ?? c.state}
                    </span>
                  ) : (
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>healthy</span>
                  )}
                </div>

                {/* Health dot + label */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: hcfg.color, boxShadow: `0 0 5px ${hcfg.color}77` }} />
                  <span className="text-[12px] font-medium" style={{ color: hcfg.color }}>
                    {hcfg.label}
                  </span>
                </div>

                {/* Health score bar + number */}
                <div className="flex items-center gap-2.5">
                  <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${c.health_score}%`, background: hcfg.color }} />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {c.health_score}
                  </span>
                </div>

                {/* Opp */}
                <div>
                  <span className="text-[15px] font-bold" style={{ color: '#00d4ff' }}>
                    {c.opportunity_score}
                  </span>
                </div>

                {/* Spend */}
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {fmt(c.total_spend)}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                    {c.total_orders} orders
                  </div>
                </div>

                {/* Last purchase */}
                <div>
                  <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.52)' }}>
                    {daysSince(c.last_purchase_at)}
                  </div>
                  {gap !== null && gap > 30 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="6" stroke="#f59e0b" strokeWidth="1.5"/>
                        <path d="M8 5v3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[10px]" style={{ color: '#f59e0b' }}>{gap}d gap</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pr-1">
                  {action ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap"
                      style={{
                        color:      action.color,
                        background: `${action.color}12`,
                        border:     `1px solid ${action.color}28`,
                      }}>
                      {action.label}
                    </span>
                  ) : (
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>No Action</span>
                  )}
                  <svg width="10" height="10" fill="none" viewBox="0 0 16 16"
                    style={{ color: 'rgba(255,255,255,0.18)', opacity: isHov ? 1 : 0, transition: 'opacity 0.12s', flexShrink: 0 }}>
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>

              </div>
            )
          })}

          <div className="py-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {filtered.length} of {customers.length} customers
          </div>
        </div>
      </div>

    </div>
  )
}
