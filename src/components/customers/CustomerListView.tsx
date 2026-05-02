'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'
import { Empty, Spinner } from '@/components/ui'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import { fullName, formatCurrency, daysSinceLabel } from '@/lib/utils'

// ─── Filter Config ─────────────────────────────────────────────────────────────

const BANDS: { key: HealthBand | 'all'; label: string; dot?: string }[] = [
  { key: 'all',    label: 'All'      },
  { key: 'red',    label: 'Critical', dot: '#ff4060' },
  { key: 'yellow', label: 'Watch',    dot: '#ffaa00' },
  { key: 'green',  label: 'Healthy',  dot: '#00e676' },
]

const STATES: { key: CustomerState | 'all'; label: string }[] = [
  { key: 'all',                 label: 'All States'            },
  { key: 'abandoned_cart',      label: 'Abandoned Cart'        },
  { key: 'failed_payment',      label: 'Failed Payment'        },
  { key: 'dormant_buyer',       label: 'Dormant Buyer'         },
  { key: 'repeat_at_risk',      label: 'VIP at Risk'           },
  { key: 'replenishment',       label: 'Replenishment'         },
  { key: 'engaged_unconverted', label: 'Engaged, Not Converted'},
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniStr(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

function dayGap(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getActionCfg(state: string, spend: number): { label: string; color: string; bg: string; border: string } {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    repeat_at_risk:      { label: 'Personal Outreach', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
    dormant_buyer:       { label: 'Win-Back',           color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
    abandoned_cart:      { label: 'Cart Recovery',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)' },
    failed_payment:      { label: 'Payment Fix',        color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',   border: 'rgba(255,140,0,0.2)'   },
    replenishment:       { label: 'Replenish Now',      color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.2)'   },
    engaged_unconverted: { label: 'Convert Now',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)'  },
  }
  if (map[state]) return map[state]
  return spend > 3000
    ? { label: 'VIP Upgrade',    color: '#00e676', bg: 'rgba(0,230,118,0.08)',  border: 'rgba(0,230,118,0.2)'  }
    : { label: 'Loyalty Reward', color: '#00d4ff', bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.18)' }
}

function getStateCfg(state: string): { label: string; color: string; bg: string } {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    abandoned_cart:      { label: 'Abandoned Cart',         color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)' },
    failed_payment:      { label: 'Failed Payment',         color: '#ff8c00', bg: 'rgba(255,140,0,0.08)'   },
    dormant_buyer:       { label: 'Dormant Buyer',          color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    repeat_at_risk:      { label: 'VIP at Risk',            color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
    replenishment:       { label: 'Replenishment',          color: '#00d4ff', bg: 'rgba(0,212,255,0.08)'   },
    engaged_unconverted: { label: 'Engaged, Not Converted', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
    active:              { label: 'Active',                 color: '#00e676', bg: 'rgba(0,230,118,0.08)'   },
    new:                 { label: 'New',                    color: '#00d4ff', bg: 'rgba(0,212,255,0.06)'   },
  }
  return map[state] ?? { label: state, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HealthBar({ score, band }: { score: number; band: HealthBand }) {
  const color = band === 'red' ? '#ff4060' : band === 'yellow' ? '#ffaa00' : '#00e676'
  const label = band === 'red' ? 'Critical' : band === 'yellow' ? 'Fair' : 'Good'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 w-[62px] flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 5px ${color}99` }} />
        <span className="text-[11px] font-medium tracking-wide" style={{ color }}>{label}</span>
      </div>
      <div className="w-14 h-[3px] rounded-full overflow-hidden flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, score)}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <span className="text-[13px] font-bold tabular-nums w-6 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerListView({
  initialBand,
  initialState,
}: {
  initialBand: HealthBand | null
  initialState: CustomerState | null
}) {
  const [customers,  setCustomers]  = useState<CustomerWithHealth[]>([])
  const [loading,    setLoading]    = useState(true)
  const [band,       setBand]       = useState<HealthBand | 'all'>(initialBand ?? 'all')
  const [state,      setState]      = useState<CustomerState | 'all'>(initialState ?? 'all')
  const [search,     setSearch]     = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (band  !== 'all') params.set('band',  band)
    if (state !== 'all') params.set('state', state)
    const res  = await fetch(`/api/customers?${params}`)
    const data = await res.json()
    const list: CustomerWithHealth[] = data.customers ?? []
    setCustomers(list)
    setLoading(false)
  }, [band, state])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q)  ||
      c.email?.toLowerCase().includes(q)
    )
  })

  // Detail view
  if (selectedId) {
    const selected = customers.find(c => c.customer_id === selectedId)
    if (selected) {
      return (
        <div className="flex-1 h-full flex flex-col" style={{ background: '#08080f' }}>
          <div className="flex items-center gap-2.5 px-8 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-white/60"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 16 16">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Customer Intelligence
            </button>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
              {fullName(selected.first_name, selected.last_name)}
            </span>
          </div>
          <CustomerDetail customer={selected} onRefresh={fetchCustomers} />
        </div>
      )
    }
  }

  const criticalCount = customers.filter(c => c.health_band === 'red').length
  const watchCount    = customers.filter(c => c.health_band === 'yellow').length

  return (
    <>
      <style>{`
        .ci-row { transition: background 0.12s ease; }
        .ci-row:hover { background: rgba(255,255,255,0.018) !important; }
        .ci-row:hover .ci-chevron { opacity: 1 !important; }
        .state-select {
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 28px !important;
        }
      `}</style>

      <div className="flex-1 overflow-y-auto h-full" style={{ background: '#08080f' }}>
        <div className="max-w-[1400px] mx-auto px-8 py-9">

          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-[3px] h-7 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(to bottom, #7c3aed, #00d4ff)' }} />
                <h1 className="text-[26px] font-bold tracking-tight text-white">
                  Customer Intelligence
                </h1>
              </div>
              <p className="text-[12.5px] ml-[18px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {customers.length} customers tracked
                {criticalCount > 0 && <span style={{ color: '#ff4060' }}> · {criticalCount} critical</span>}
                {watchCount    > 0 && <span style={{ color: '#ffaa00' }}> · {watchCount} on watchlist</span>}
              </p>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="mb-6 space-y-3">

            {/* Row 1: Band pills + State dropdown */}
            <div className="flex items-center gap-3 flex-wrap">

              {/* Health band pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {BANDS.map(({ key, label, dot }) => {
                  const active = band === key
                  return (
                    <button
                      key={key}
                      onClick={() => setBand(key as HealthBand | 'all')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                      style={active ? {
                        background: key === 'all'
                          ? 'rgba(255,255,255,0.08)'
                          : dot ? `${dot}15` : 'rgba(255,255,255,0.08)',
                        color: key === 'all' ? 'rgba(255,255,255,0.85)' : dot ?? 'rgba(255,255,255,0.85)',
                        border: `1px solid ${key === 'all' ? 'rgba(255,255,255,0.15)' : dot ? `${dot}35` : 'rgba(255,255,255,0.15)'}`,
                      } : {
                        color: 'rgba(255,255,255,0.35)',
                        border: '1px solid transparent',
                      }}>
                      {dot && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: dot, boxShadow: active ? `0 0 6px ${dot}` : undefined }} />
                      )}
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* State dropdown */}
              <select
                value={state}
                onChange={(e) => setState(e.target.value as CustomerState | 'all')}
                className="state-select px-3 py-2 rounded-xl text-[11px] font-medium outline-none transition-all cursor-pointer"
                style={{
                  background: state !== 'all' ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                  color: state !== 'all' ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                  border: state !== 'all'
                    ? '1px solid rgba(124,58,237,0.25)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}>
                {STATES.map(({ key, label }) => (
                  <option key={key} value={key} style={{ background: '#0d0d1f' }}>{label}</option>
                ))}
              </select>

              {/* Search — pushed right */}
              <div className="relative ml-auto">
                <svg width="13" height="13" fill="none" viewBox="0 0 16 16"
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-xl text-[11px] outline-none transition-all w-60"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.012)' }}>

            {/* Column headers */}
            <div className="grid px-6 py-3.5"
              style={{
                gridTemplateColumns: '2.2fr 1.3fr 1.7fr 1fr 0.9fr 1.1fr 1.3fr 1.3fr',
                background: 'rgba(255,255,255,0.018)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
              {['Customer', 'State', 'Health', 'Health Score', 'Opp. Score', 'Total Spend', 'Last Purchase', 'Action'].map((h) => (
                <span key={h} className="text-[10px] font-semibold tracking-[0.13em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-20 text-[13px]"
                style={{ color: 'rgba(255,255,255,0.2)' }}>
                <Spinner size={14} /> Loading customers…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-[13px]"
                style={{ color: 'rgba(255,255,255,0.18)' }}>
                No customers match this filter
              </div>
            ) : (
              filtered.map((c, i) => {
                const name      = fullName(c.first_name, c.last_name)
                const isUrgent  = c.health_band === 'red'
                const isVIP     = (c.total_spend ?? 0) > 2000
                const gap       = dayGap(c.last_purchase_at)
                const stateCfg  = getStateCfg(c.state)
                const actionCfg = getActionCfg(c.state, c.total_spend ?? 0)
                const hColor    = c.health_band === 'red' ? '#ff4060' : c.health_band === 'yellow' ? '#ffaa00' : '#00e676'
                const isLast    = i === filtered.length - 1

                return (
                  <div
                    key={c.customer_id}
                    className="ci-row grid px-6 py-4 relative cursor-pointer"
                    style={{
                      gridTemplateColumns: '2.2fr 1.3fr 1.7fr 1fr 0.9fr 1.1fr 1.3fr 1.3fr',
                      borderBottom: !isLast ? '1px solid rgba(255,255,255,0.038)' : undefined,
                      background: 'transparent',
                    }}
                    onClick={() => setSelectedId(c.customer_id)}>

                    {/* Urgent left accent */}
                    {isUrgent && (
                      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r"
                        style={{ background: '#ff4060', boxShadow: '0 0 8px rgba(255,64,96,0.4)' }} />
                    )}

                    {/* Customer */}
                    <div className="flex items-center gap-3 pr-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 tracking-wide"
                        style={{ background: `${hColor}12`, color: hColor, border: `1px solid ${hColor}20` }}>
                        {iniStr(c.first_name, c.last_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold truncate"
                            style={{ color: 'rgba(255,255,255,0.85)' }}>{name}</span>
                          {isVIP && (
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="#f59e0b" className="flex-shrink-0">
                              <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z"/>
                            </svg>
                          )}
                        </div>
                        <div className="text-[10px] truncate mt-0.5"
                          style={{ color: 'rgba(255,255,255,0.22)' }}>{c.email}</div>
                      </div>
                    </div>

                    {/* State */}
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide"
                        style={{
                          color: stateCfg.color,
                          background: stateCfg.bg,
                          border: `1px solid ${stateCfg.color}22`,
                        }}>
                        {stateCfg.label}
                      </span>
                    </div>

                    {/* Health */}
                    <div className="flex items-center">
                      <HealthBar score={c.health_score} band={c.health_band} />
                    </div>

                    {/* Health Score */}
                    <div className="flex items-center">
                      <span className="text-[15px] font-bold tabular-nums" style={{ color: hColor }}>
                        {c.health_score}
                      </span>
                    </div>

                    {/* Opp Score */}
                    <div className="flex items-center">
                      <span className="text-[15px] font-bold tabular-nums" style={{ color: '#00d4ff' }}>
                        {c.opportunity_score}
                      </span>
                    </div>

                    {/* Total Spend */}
                    <div className="flex items-center">
                      <div>
                        <div className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {formatCurrency(c.total_spend)}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {c.total_orders} orders
                        </div>
                      </div>
                    </div>

                    {/* Last Purchase */}
                    <div className="flex items-center">
                      <div>
                        <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.48)' }}>
                          {daysSinceLabel(c.last_purchase_at)}
                        </div>
                        {gap !== null && gap > 30 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <svg width="9" height="9" fill="none" viewBox="0 0 16 16"
                              style={{ color: gap > 90 ? '#ff4060' : '#f59e0b', flexShrink: 0 }}>
                              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                              <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                            <span className="text-[10px] font-semibold"
                              style={{ color: gap > 90 ? '#ff4060' : '#f59e0b' }}>
                              {gap}d gap
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          color: actionCfg.color,
                          background: actionCfg.bg,
                          border: `1px solid ${actionCfg.border}`,
                        }}>
                        {actionCfg.label}
                      </span>
                      <svg className="ci-chevron flex-shrink-0" width="10" height="10" fill="none" viewBox="0 0 16 16"
                        style={{ color: 'rgba(255,255,255,0.18)', opacity: 0, transition: 'opacity 0.1s' }}>
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                  </div>
                )
              })
            )}
          </div>

          {/* Footer count */}
          {!loading && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
                {search && ` matching "${search}"`}
              </span>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
