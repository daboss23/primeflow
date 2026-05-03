'use client'

// FILE: src/components/customers/CustomerListView.tsx

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  initialBand?: HealthBand | null
  initialState?: CustomerState | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEALTH_BANDS = [
  { key: 'all',    label: 'All',      color: 'rgba(255,255,255,0.5)' },
  { key: 'red',    label: 'Critical', color: '#ff4060' },
  { key: 'yellow', label: 'Watch',    color: '#f59e0b' },
  { key: 'green',  label: 'Healthy',  color: '#00e676' },
] as const

const STATE_OPTIONS = [
  { key: 'all',                label: 'All States' },
  { key: 'abandoned_cart',     label: 'Abandoned Cart' },
  { key: 'failed_payment',     label: 'Failed Payment' },
  { key: 'dormant_buyer',      label: 'Dormant Buyer' },
  { key: 'repeat_at_risk',     label: 'VIP at Risk' },
  { key: 'replenishment',      label: 'Replenishment' },
  { key: 'engaged_unconverted',label: 'Engaged, Not Converted' },
]

const STATE_COLORS: Record<string, string> = {
  abandoned_cart:       '#ff4d4d',
  failed_payment:       '#ff8c00',
  dormant_buyer:        '#a78bfa',
  repeat_at_risk:       '#f59e0b',
  replenishment:        '#00d4ff',
  engaged_unconverted:  '#8b5cf6',
}

const STATE_LABELS: Record<string, string> = {
  abandoned_cart:       'Abandoned Cart',
  failed_payment:       'Failed Payment',
  dormant_buyer:        'Dormant',
  repeat_at_risk:       'VIP At Risk',
  replenishment:        'Replenishment',
  engaged_unconverted:  'Unconverted',
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

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  abandoned_cart:       { label: 'Recover Cart',      color: '#ff4d4d' },
  failed_payment:       { label: 'Fix Payment',        color: '#ff8c00' },
  dormant_buyer:        { label: 'Win-Back',           color: '#a78bfa' },
  repeat_at_risk:       { label: 'Personal Outreach',  color: '#f59e0b' },
  replenishment:        { label: 'Replenish',          color: '#00d4ff' },
  engaged_unconverted:  { label: 'Convert Now',        color: '#8b5cf6' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSinceLabel(iso: string | null): string {
  if (!iso) return 'Never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

function dayGap(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
}

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString()}`
}

function fullName(first: string | null, last: string | null): string {
  return [first, last].filter(Boolean).join(' ') || 'Unknown'
}

function initials(first: string | null, last: string | null): string {
  return [(first ?? '')[0], (last ?? '')[0]].filter(Boolean).join('').toUpperCase() || '?'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HealthDot({ band }: { band: string }) {
  const color = HEALTH_COLORS[band] ?? 'rgba(255,255,255,0.3)'
  const label = HEALTH_LABELS[band] ?? band
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}88` }} />
      <span className="text-[12px] font-medium" style={{ color }}>{label}</span>
    </div>
  )
}

function HealthBar({ score, band }: { score: number; band: string }) {
  const color = HEALTH_COLORS[band] ?? 'rgba(255,255,255,0.3)'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[12px] font-semibold text-white/70 w-6 text-right">{score}</span>
    </div>
  )
}

function StateChip({ state }: { state: string }) {
  const color = STATE_COLORS[state] ?? 'rgba(255,255,255,0.3)'
  const label = STATE_LABELS[state] ?? state
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}
    >
      {label}
    </span>
  )
}

function ActionBadge({ state }: { state: string }) {
  const cfg = ACTION_LABELS[state]
  if (!cfg) return <span className="text-[11px] text-white/20">—</span>
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer hover:opacity-90 transition-all"
      style={{ color: cfg.color, background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}
    >
      {cfg.label}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerListView({ initialBand, initialState }: Props) {
  const router = useRouter()

  const [customers, setCustomers] = useState<CustomerWithHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [band, setBand] = useState<string>(initialBand ?? 'all')
  const [state, setState] = useState<string>(initialState ?? 'all')
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (band !== 'all') params.set('band', band)
      if (state !== 'all') params.set('state', state)
      const res = await fetch(`/api/customers?${params}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [band, state])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showStateDropdown) return
    const handler = () => setShowStateDropdown(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showStateDropdown])

  const filtered = customers.filter((c) => {
    if (!search) return true
    const name = fullName(c.first_name, c.last_name).toLowerCase()
    const email = (c.email ?? '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const criticalCount = customers.filter((c) => c.health_band === 'red').length
  const watchCount    = customers.filter((c) => c.health_band === 'yellow').length
  const selectedStateLabel = STATE_OPTIONS.find((s) => s.key === state)?.label ?? 'All States'

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#070714' }}>
      <div className="max-w-[1400px] mx-auto px-8 py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full bg-[#00d4ff]" />
            <h1 className="text-[26px] font-bold text-white tracking-tight">Customer Intelligence</h1>
          </div>
          <p className="text-[13px] text-white/35 ml-4">
            {customers.length} customers tracked
            {criticalCount > 0 && <> · <span style={{ color: '#ff4060' }}>{criticalCount} critical</span></>}
            {watchCount > 0 && <> · <span style={{ color: '#f59e0b' }}>{watchCount} on watchlist</span></>}
          </p>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">

          {/* State dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowStateDropdown(!showStateDropdown)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all"
              style={{
                background: state !== 'all' ? `${STATE_COLORS[state] ?? '#00d4ff'}15` : 'rgba(255,255,255,0.05)',
                border: state !== 'all' ? `1px solid ${STATE_COLORS[state] ?? '#00d4ff'}30` : '1px solid rgba(255,255,255,0.09)',
                color: state !== 'all' ? (STATE_COLORS[state] ?? '#00d4ff') : 'rgba(255,255,255,0.6)',
              }}
            >
              {selectedStateLabel}
              <svg width="12" height="12" fill="none" viewBox="0 0 16 16" style={{ transform: showStateDropdown ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}>
                <path d="M3 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showStateDropdown && (
              <div
                className="absolute top-full left-0 mt-1.5 w-52 rounded-xl overflow-hidden z-50"
                style={{ background: '#0e0e24', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
              >
                {STATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setState(opt.key); setShowStateDropdown(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-left transition-all"
                    style={state === opt.key
                      ? { background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }
                      : { color: 'rgba(255,255,255,0.55)', background: 'transparent' }
                    }
                    onMouseEnter={(e) => { if (state !== opt.key) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={(e) => { if (state !== opt.key) (e.target as HTMLElement).style.background = 'transparent' }}
                  >
                    {opt.key !== 'all' && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATE_COLORS[opt.key] ?? 'transparent' }} />
                    )}
                    {state === opt.key && <span className="text-[#00d4ff] mr-1">✓</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Health band pills */}
          {HEALTH_BANDS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBand(b.key)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all"
              style={band === b.key
                ? { background: b.key === 'all' ? 'rgba(255,255,255,0.1)' : `${b.color}20`, color: b.key === 'all' ? 'white' : b.color, border: `1px solid ${b.key === 'all' ? 'rgba(255,255,255,0.2)' : `${b.color}40`}` }
                : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {b.key !== 'all' && (
                <div className="w-2 h-2 rounded-full" style={{ background: b.color, boxShadow: band === b.key ? `0 0 5px ${b.color}` : undefined }} />
              )}
              {b.label}
            </button>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width="13" height="13" fill="none" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-[12px] outline-none transition-all w-64"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
              }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Column headers */}
          <div
            className="grid px-6 py-3.5"
            style={{
              gridTemplateColumns: '2.2fr 1fr 1.1fr 1fr 0.9fr 1.1fr 1fr 0.6fr',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {['Customer', 'State', 'Health', 'Health Score', 'Opp. Score', 'Total Spend', 'Last Purchase', 'Action'].map((h) => (
              <span key={h} className="text-[10px] font-semibold tracking-[0.13em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="text-[13px] text-white/25">Loading customers…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-[13px] text-white/25">No customers match your filters</div>
            </div>
          ) : (
            filtered.map((c, i) => {
              const name = fullName(c.first_name, c.last_name)
              const ini  = initials(c.first_name, c.last_name)
              const gap  = dayGap(c.last_purchase_at)
              const isCritical = c.health_band === 'red'
              const isWatch    = c.health_band === 'yellow'

              return (
                <div
                  key={c.customer_id}
                  className="grid px-6 py-4 cursor-pointer transition-all"
                  style={{
                    gridTemplateColumns: '2.2fr 1fr 1.1fr 1fr 0.9fr 1.1fr 1fr 0.6fr',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    background: hoveredRow === c.customer_id ? 'rgba(255,255,255,0.025)' : 'transparent',
                    borderLeft: isCritical ? '2px solid #ff4060' : isWatch ? '2px solid #f59e0b' : '2px solid transparent',
                  }}
                  onMouseEnter={() => setHoveredRow(c.customer_id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => router.push(`/customers/${c.customer_id}`)}
                >
                  {/* Customer */}
                  <div className="flex items-center gap-3 pr-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{
                        background: isCritical
                          ? 'linear-gradient(135deg, #8b1a2e, #c0253a)'
                          : isWatch
                          ? 'linear-gradient(135deg, #78450a, #b8690f)'
                          : 'linear-gradient(135deg, #0d3320, #0e5c35)',
                      }}
                    >
                      {ini}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-white/90 truncate">{name}</div>
                      <div className="text-[11px] text-white/30 truncate">{c.email}</div>
                    </div>
                  </div>

                  {/* State */}
                  <div className="flex items-center">
                    <StateChip state={c.state} />
                  </div>

                  {/* Health dot */}
                  <div className="flex items-center">
                    <HealthDot band={c.health_band} />
                  </div>

                  {/* Health score bar */}
                  <div className="flex items-center">
                    <HealthBar score={c.health_score} band={c.health_band} />
                  </div>

                  {/* Opp score */}
                  <div className="flex items-center">
                    <span className="text-[14px] font-bold" style={{ color: '#00d4ff' }}>
                      {c.opportunity_score}
                    </span>
                  </div>

                  {/* Total spend */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-[13px] font-semibold text-white/80">{formatCurrency(c.total_spend)}</div>
                      <div className="text-[10px] text-white/25">{c.total_orders} orders</div>
                    </div>
                  </div>

                  {/* Last purchase */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-[12px] text-white/65">{daysSinceLabel(c.last_purchase_at)}</div>
                      {gap !== null && gap > 30 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                            <circle cx="8" cy="8" r="6" stroke="#f59e0b" strokeWidth="1.5"/>
                            <path d="M8 5v3.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span className="text-[10px]" style={{ color: '#f59e0b' }}>{gap}d gap</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between">
                    <ActionBadge state={c.state} />
                    <svg
                      width="14" height="14" fill="none" viewBox="0 0 16 16"
                      style={{ color: 'rgba(255,255,255,0.2)', opacity: hoveredRow === c.customer_id ? 1 : 0, transition: 'opacity 0.15s' }}
                    >
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-white/20">
            {filtered.length} of {customers.length} customers shown
          </p>
          {(band !== 'all' || state !== 'all' || search) && (
            <button
              onClick={() => { setBand('all'); setState('all'); setSearch('') }}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
