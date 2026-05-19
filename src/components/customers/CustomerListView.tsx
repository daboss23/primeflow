'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'
import { Empty, Spinner, PageHeader } from '@/components/ui'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import { fullName, formatCurrency, daysSinceLabel } from '@/lib/utils'
import { OracleIcon } from '@/components/oracle/OracleBrief'

// ─── Filter Config ─────────────────────────────────────────────────────────────

const BANDS: { key: HealthBand | 'all'; label: string; dot?: string }[] = [
  { key: 'all',    label: 'All'      },
  { key: 'red',    label: 'Critical', dot: '#ff4060' },
  { key: 'yellow', label: 'Watch',    dot: '#ffaa00' },
  { key: 'green',  label: 'Healthy',  dot: '#00e676' },
]

const STATES: { key: CustomerState | 'all'; label: string }[] = [
  { key: 'all',                 label: 'All States'             },
  { key: 'abandoned_cart',      label: 'Abandoned Cart'         },
  { key: 'failed_payment',      label: 'Failed Payment'         },
  { key: 'dormant_buyer',       label: 'Dormant Buyer'          },
  { key: 'repeat_at_risk',      label: 'VIP at Risk'            },
  { key: 'replenishment',       label: 'Replenishment'          },
  { key: 'engaged_unconverted', label: 'Engaged, Not Converted' },
]

// ─── Oracle Customer Risk Panel ───────────────────────────────────────────────

function OracleCustomerPanel({ customers }: { customers: CustomerWithHealth[] }) {
  const critical    = customers.filter(c => c.health_band === 'red')
  const vipCritical = critical.filter(c => (c.total_spend ?? 0) > 1500)
  const atRiskLTV   = critical.reduce((sum, c) => sum + (c.total_spend ?? 0), 0)

  if (critical.length === 0) return null

  const signals: Array<{ color: string; bg: string; border: string; title: string; body: string; nextPlay: string; critical?: boolean }> = []

  if (vipCritical.length > 0) {
    const topVip = [...vipCritical].sort((a, b) => (b.total_spend ?? 0) - (a.total_spend ?? 0))[0]
    signals.push({
      color: '#ff4060', bg: 'rgba(255,64,96,0.07)', border: 'rgba(255,64,96,0.2)',
      title: `${vipCritical.length} high-value customer${vipCritical.length > 1 ? 's' : ''} in critical state`,
      body: `${fullName(topVip.first_name, topVip.last_name)} and ${vipCritical.length - 1} other${vipCritical.length > 2 ? 's' : ''} above $1,500 LTV — all in red-band health.`,
      nextPlay: 'Initiate personal outreach for top-LTV at-risk customers.',
      critical: true,
    })
  }

  if (atRiskLTV > 0) {
    signals.push({
      color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)',
      title: `$${atRiskLTV.toLocaleString()} LTV at risk`,
      body: `${critical.length} critical-band customers account for this combined lifetime value. Recovery window is narrowing.`,
      nextPlay: 'Sort by opportunity score. Prioritize top 3 by recovery potential.',
    })
  }

  const byOpp = [...critical].sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0)).slice(0, 1)[0]
  if (byOpp) {
    signals.push({
      color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.18)',
      title: 'Highest recovery opportunity',
      body: `${fullName(byOpp.first_name, byOpp.last_name)} — opportunity score ${byOpp.opportunity_score}, state: ${byOpp.state?.replace(/_/g, ' ') ?? 'unknown'}.`,
      nextPlay: `Open ${fullName(byOpp.first_name, byOpp.last_name)}'s profile and generate outreach now.`,
    })
  }

  const topSignals = signals.slice(0, 3)

  return (
    <div className="mb-6 rounded-xl oracle-panel-in relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.016)',
        border: '1px solid rgba(255,64,96,0.16)',
      }}>

      <div className="oracle-scan-line"
        style={{ '--scan-color': '#ff4060' } as React.CSSProperties} />

      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <OracleIcon size={12} />
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase oracle-gradient-text">Oracle</span>
          <div className="w-px h-3 bg-white/[0.07]" />
          <span className="text-[9px] font-medium tracking-[0.1em] uppercase" style={{ color: '#ff4060' }}>
            {critical.length} customer{critical.length !== 1 ? 's' : ''} require attention
          </span>
        </div>
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Based on current health scores
        </span>
      </div>

      <div className="flex gap-3 p-3">
        {topSignals.map((sig, i) => (
          <div key={i} className="flex-1 rounded-lg px-3.5 py-2.5"
            style={{ background: sig.bg, border: `1px solid ${sig.border}` }}>

            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-semibold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded"
                style={{ color: sig.color, background: `${sig.color}12` }}>
                {sig.critical ? 'Critical' : i === 1 ? 'Risk' : 'Opportunity'}
              </span>
              {sig.critical && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ background: sig.color }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: sig.color }} />
                </span>
              )}
            </div>

            <div className="text-[11px] font-semibold leading-snug mb-1"
              style={{ color: 'rgba(255,255,255,0.85)' }}>
              {sig.title}
            </div>

            <div className="text-[10px] leading-relaxed mb-2"
              style={{ color: 'rgba(255,255,255,0.42)' }}>
              {sig.body}
            </div>

            <div className="flex items-start gap-1">
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none"
                className="mt-0.5 flex-shrink-0" style={{ color: sig.color }}>
                <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-medium leading-snug" style={{ color: sig.color }}>
                {sig.nextPlay}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayGap(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function getActionCfg(state: string, spend: number) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    repeat_at_risk:      { label: 'Personal Outreach', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
    dormant_buyer:       { label: 'Win-Back',           color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
    abandoned_cart:      { label: 'Cart Recovery',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)' },
    failed_payment:      { label: 'Payment Fix',        color: '#ff8c00', bg: 'rgba(255,140,0,0.1)',   border: 'rgba(255,140,0,0.3)'   },
    replenishment:       { label: 'Replenish Now',      color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.3)'   },
    engaged_unconverted: { label: 'Convert Now',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.3)'  },
  }
  if (map[state]) return map[state]
  return spend > 3000
    ? { label: 'VIP Upgrade',    color: '#00e676', bg: 'rgba(0,230,118,0.1)',  border: 'rgba(0,230,118,0.3)'  }
    : { label: 'Loyalty Reward', color: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)' }
}

function getStateCfg(state: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    abandoned_cart:      { label: 'Abandoned Cart',         color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
    failed_payment:      { label: 'Failed Payment',         color: '#ff8c00', bg: 'rgba(255,140,0,0.1)'   },
    dormant_buyer:       { label: 'Dormant Buyer',          color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    repeat_at_risk:      { label: 'VIP at Risk',            color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    replenishment:       { label: 'Replenishment',          color: '#00d4ff', bg: 'rgba(0,212,255,0.1)'   },
    engaged_unconverted: { label: 'Engaged, Not Converted', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
    active:              { label: 'Active',                 color: '#00e676', bg: 'rgba(0,230,118,0.1)'   },
    new:                 { label: 'New',                    color: '#00d4ff', bg: 'rgba(0,212,255,0.08)'  },
  }
  return map[state] ?? { label: state, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' }
}

// ─── Health Bar ───────────────────────────────────────────────────────────────

function HealthBar({ score, band }: { score: number; band: HealthBand }) {
  const color = band === 'red' ? '#ff4060' : band === 'yellow' ? '#ffaa00' : '#00e676'
  const label = band === 'red' ? 'Critical' : band === 'yellow' ? 'Fair' : 'Good'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 w-14">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
        <span className="text-[11px] font-medium" style={{ color }}>{label}</span>
      </div>
      <div className="w-14 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full"
          style={{ width: `${Math.min(100, score)}%`, background: color }} />
      </div>
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
    setCustomers(data.customers ?? [])
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

  // ── Detail view ──
  if (selectedId) {
    const selected = customers.find(c => c.customer_id === selectedId)
    if (selected) {
      return (
        <div className="flex-1 h-full" style={{ background: '#070714' }}>
          <CustomerDetail
            customer={selected}
            onRefresh={fetchCustomers} onBack={() => setSelectedId(null)}
            
          />
        </div>
      )
    }
  }

  const criticalCount = customers.filter(c => c.health_band === 'red').length
  const watchCount    = customers.filter(c => c.health_band === 'yellow').length

  // ── List view ──
  return (
    <div className="flex-1 overflow-y-auto h-full" style={{ background: '#070714' }}>
      <div className="px-8 py-8">

        {/* Page header */}
        <PageHeader
          title="Customer Intelligence"
          subtitle={`${customers.length} customers tracked${criticalCount > 0 ? ` · ${criticalCount} critical` : ''}${watchCount > 0 ? ` · ${watchCount} on watchlist` : ''}`}
        />

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">

          {/* Band pills */}
          <div className="flex items-center gap-1.5">
            {BANDS.map(({ key, label, dot }) => {
              const active = band === key
              return (
                <button key={key} onClick={() => setBand(key as HealthBand | 'all')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={active
                    ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }
                    : { color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {dot && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dot, boxShadow: active ? `0 0 5px ${dot}` : undefined }} />
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
            className="px-3 py-1.5 rounded-full text-[11px] font-medium outline-none"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
            }}>
            {STATES.map(({ key, label }) => (
              <option key={key} value={key} className="bg-[#0d0d1f]">{label}</option>
            ))}
          </select>

          {/* Search */}
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
              className="pl-8 pr-4 py-1.5 rounded-full text-[11px] outline-none w-56"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            />
          </div>
        </div>

        {/* Oracle Customer Risk Intelligence */}
        {!loading && <OracleCustomerPanel customers={customers} />}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Column headers */}
          <div className="grid px-6 py-3"
            style={{
              gridTemplateColumns: '2fr 1.4fr 1.5fr 0.9fr 0.9fr 1fr 1.2fr 1.3fr',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
            {['Customer', 'State', 'Health', 'Health Score', 'Opp. Score', 'Total Spend', 'Last Purchase', 'Action'].map((h) => (
              <span key={h} className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: 'rgba(255,255,255,0.22)' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[13px]"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              <Spinner size={14} /> Loading customers…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
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
              const isOracleFlag = isUrgent && isVIP

              return (
                <div key={c.customer_id}
                  className="grid px-6 py-4 relative cursor-pointer transition-all hover:bg-white/[0.02] oracle-row-highlight group"
                  style={{
                    gridTemplateColumns: '2fr 1.4fr 1.5fr 0.9fr 0.9fr 1fr 1.2fr 1.3fr',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    background: isOracleFlag ? 'rgba(255,64,96,0.03)' : undefined,
                  }}
                  onClick={() => setSelectedId(c.customer_id)}>

                  {/* Urgent left edge bar */}
                  {isUrgent && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-r"
                      style={{ background: '#ff4060', boxShadow: '1px 0 8px rgba(255,64,96,0.25)' }} />
                  )}

                  {/* Customer */}
                  <div className="flex items-center gap-3 pr-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: `${hColor}15`, color: hColor }}>
                      {`${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium truncate"
                          style={{ color: 'rgba(255,255,255,0.82)' }}>{name}</span>
                        {isVIP && (
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="#f59e0b" className="flex-shrink-0">
                            <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z"/>
                          </svg>
                        )}
                        {isOracleFlag && (
                          <span className="oracle-badge-pulse flex-shrink-0">
                            <OracleIcon size={10} />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {c.email}
                      </div>
                    </div>
                  </div>

                  {/* State */}
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ color: stateCfg.color, background: stateCfg.bg }}>
                      {stateCfg.label}
                    </span>
                  </div>

                  {/* Health bar + label */}
                  <div className="flex items-center">
                    <HealthBar score={c.health_score} band={c.health_band} />
                  </div>

                  {/* Health score */}
                  <div className="flex items-center">
                    <span className="text-[14px] font-bold tabular-nums" style={{ color: hColor }}>
                      {c.health_score}
                    </span>
                  </div>

                  {/* Opp score */}
                  <div className="flex items-center">
                    <span className="text-[14px] font-bold tabular-nums" style={{ color: '#00d4ff' }}>
                      {c.opportunity_score}
                    </span>
                  </div>

                  {/* Total spend */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.68)' }}>
                        {formatCurrency(c.total_spend)}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
                        {c.total_orders} orders
                      </div>
                    </div>
                  </div>

                  {/* Last purchase + gap */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.48)' }}>
                        {daysSinceLabel(c.last_purchase_at)}
                      </div>
                      {gap !== null && gap > 30 && (
                        <div className="text-[10px] mt-0.5 font-semibold"
                          style={{ color: gap > 90 ? '#ff4060' : '#f59e0b' }}>
                          ⏱ {gap}d gap
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all group-hover:opacity-90"
                      style={{ color: actionCfg.color, background: actionCfg.bg, border: `1px solid ${actionCfg.border}` }}>
                      {actionCfg.label}
                      <svg width="8" height="8" fill="none" viewBox="0 0 16 16">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>

                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </span>
          </div>
        )}

      </div>
    </div>
  )
}
