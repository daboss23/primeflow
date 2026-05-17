'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'
import {
  Empty, Spinner, PageHeader, Pill, StatusDot, tokens, ProgressBar,
} from '@/components/ui'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import { fullName, formatCurrency, daysSinceLabel } from '@/lib/utils'

// ─── Filter Config ─────────────────────────────────────────────────────────────

const BANDS: { key: HealthBand | 'all'; label: string; tone?: 'danger' | 'warn' | 'success' }[] = [
  { key: 'all',    label: 'All' },
  { key: 'red',    label: 'Critical', tone: 'danger'  },
  { key: 'yellow', label: 'Watch',    tone: 'warn'    },
  { key: 'green',  label: 'Healthy',  tone: 'success' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayGap(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

type Tone = 'accent' | 'violet' | 'success' | 'warn' | 'danger' | 'neutral'

function actionFor(state: string, spend: number): { label: string; tone: Tone } {
  const map: Record<string, { label: string; tone: Tone }> = {
    repeat_at_risk:      { label: 'Personal Outreach', tone: 'violet' },
    dormant_buyer:       { label: 'Win-Back',          tone: 'warn'   },
    abandoned_cart:      { label: 'Cart Recovery',     tone: 'danger' },
    failed_payment:      { label: 'Payment Fix',       tone: 'warn'   },
    replenishment:       { label: 'Replenish Now',     tone: 'accent' },
    engaged_unconverted: { label: 'Convert Now',       tone: 'violet' },
  }
  if (map[state]) return map[state]
  return spend > 3000
    ? { label: 'VIP Upgrade',    tone: 'success' }
    : { label: 'Loyalty Reward', tone: 'accent'  }
}

function stateConfig(state: string): { label: string; tone: Tone } {
  const map: Record<string, { label: string; tone: Tone }> = {
    abandoned_cart:      { label: 'Abandoned Cart',         tone: 'danger'  },
    failed_payment:      { label: 'Failed Payment',         tone: 'warn'    },
    dormant_buyer:       { label: 'Dormant Buyer',          tone: 'violet'  },
    repeat_at_risk:      { label: 'VIP at Risk',            tone: 'warn'    },
    replenishment:       { label: 'Replenishment',          tone: 'accent'  },
    engaged_unconverted: { label: 'Engaged, Not Converted', tone: 'violet'  },
    active:              { label: 'Active',                 tone: 'success' },
    new:                 { label: 'New',                    tone: 'accent'  },
  }
  return map[state] ?? { label: state, tone: 'neutral' }
}

// ─── Health Bar ───────────────────────────────────────────────────────────────

function HealthBar({ score, band }: { score: number; band: HealthBand }) {
  const colors = { red: '#ff4d6a', yellow: '#ffaa00', green: '#3ddc97' }
  const labels = { red: 'Critical', yellow: 'Fair', green: 'Good' }
  const tones: Record<HealthBand, Tone> = { red: 'danger', yellow: 'warn', green: 'success' }
  const color = colors[band]
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 w-[60px]">
        <StatusDot tone={tones[band]} size={5} />
        <span className="text-[11px] font-medium" style={{ color }}>{labels[band]}</span>
      </div>
      <div className="w-14">
        <ProgressBar value={Math.min(100, score)} color={color} height={2} />
      </div>
    </div>
  )
}

const GRID_COLUMNS = '2fr 1.4fr 1.5fr 0.9fr 0.9fr 1fr 1.2fr 1.3fr'

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
        <div className="flex-1 h-full" style={{ background: 'var(--bg-base)' }}>
          <CustomerDetail
            customer={selected}
            onRefresh={fetchCustomers}
            onBack={() => setSelectedId(null)}
          />
        </div>
      )
    }
  }

  const criticalCount = customers.filter(c => c.health_band === 'red').length
  const watchCount    = customers.filter(c => c.health_band === 'yellow').length

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="px-10 py-10 max-w-[1440px]">
        <PageHeader
          eyebrow="Customer Intelligence"
          title="Customers"
          subtitle={`${customers.length} tracked${criticalCount > 0 ? ` · ${criticalCount} critical` : ''}${watchCount > 0 ? ` · ${watchCount} on watchlist` : ''}.`}
        />

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1">
            {BANDS.map(({ key, label, tone }) => {
              const active = band === key
              return (
                <button
                  key={key}
                  onClick={() => setBand(key as HealthBand | 'all')}
                  className={`
                    flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[11.5px] font-medium transition-all border
                    ${active
                      ? 'text-white border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)]'
                      : 'text-white/45 border-transparent hover:text-white/80 hover:bg-[rgba(255,255,255,0.035)]'
                    }
                  `}
                >
                  {tone && <StatusDot tone={tone} size={5} />}
                  {label}
                </button>
              )
            })}
          </div>

          <select
            value={state}
            onChange={(e) => setState(e.target.value as CustomerState | 'all')}
            className="h-8 px-3 rounded-[8px] text-[11.5px] font-medium outline-none cursor-pointer transition-all
              text-white/65 hover:text-white/85
              border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.025)]
              focus:border-[rgba(0,212,255,0.40)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]"
          >
            {STATES.map(({ key, label }) => (
              <option key={key} value={key} style={{ background: '#0a0a14' }}>{label}</option>
            ))}
          </select>

          <div className="relative ml-auto">
            <svg
              width="13" height="13" fill="none" viewBox="0 0 16 16"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3.5 h-8 rounded-[8px] text-[12px] outline-none w-64 transition-all
                text-white/85 placeholder:text-white/30
                bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.10)]
                focus:border-[rgba(0,212,255,0.40)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]"
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-[14px] overflow-hidden"
          style={{ border: `1px solid ${tokens.borderSubtle}`, background: tokens.surface }}
        >
          {/* Headers */}
          <div
            className="grid px-6 py-3"
            style={{
              gridTemplateColumns: GRID_COLUMNS,
              borderBottom: `1px solid ${tokens.borderSubtle}`,
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            {['Customer', 'State', 'Health', 'Score', 'Opp.', 'Spend', 'Last Purchase', 'Action'].map((h) => (
              <span key={h} className="eyebrow" style={{ fontSize: 9.5 }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center gap-2 py-16 text-[13px]"
              style={{ color: tokens.textMuted }}
            >
              <Spinner size={14} /> Loading customers…
            </div>
          ) : filtered.length === 0 ? (
            <Empty message="No customers match this filter." />
          ) : (
            filtered.map((c, i) => {
              const name      = fullName(c.first_name, c.last_name)
              const isUrgent  = c.health_band === 'red'
              const isVIP     = (c.total_spend ?? 0) > 2000
              const gap       = dayGap(c.last_purchase_at)
              const stateCfg  = stateConfig(c.state)
              const action    = actionFor(c.state, c.total_spend ?? 0)
              const hColor    = c.health_band === 'red' ? '#ff4d6a' : c.health_band === 'yellow' ? '#ffaa00' : '#3ddc97'

              return (
                <div
                  key={c.customer_id}
                  className="grid px-6 py-3.5 relative cursor-pointer transition-colors group"
                  style={{
                    gridTemplateColumns: GRID_COLUMNS,
                    borderBottom: i < filtered.length - 1 ? `1px solid ${tokens.borderSubtle}` : undefined,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.022)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  onClick={() => setSelectedId(c.customer_id)}
                >
                  {isUrgent && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                      style={{ width: 2, height: 22, background: '#ff4d6a', boxShadow: '0 0 8px rgba(255,77,106,0.5)' }}
                    />
                  )}

                  {/* Customer */}
                  <div className="flex items-center gap-3 pr-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[10.5px] font-semibold flex-shrink-0"
                      style={{ background: `${hColor}14`, color: hColor, border: `1px solid ${hColor}28` }}
                    >
                      {`${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium truncate" style={{ color: tokens.textPrimary }}>
                          {name}
                        </span>
                        {isVIP && (
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="#ffaa00" className="flex-shrink-0">
                            <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z"/>
                          </svg>
                        )}
                      </div>
                      <div className="text-[11px] truncate mt-0.5" style={{ color: tokens.textMuted }}>
                        {c.email}
                      </div>
                    </div>
                  </div>

                  {/* State */}
                  <div className="flex items-center">
                    <Pill tone={stateCfg.tone}>{stateCfg.label}</Pill>
                  </div>

                  {/* Health bar */}
                  <div className="flex items-center">
                    <HealthBar score={c.health_score} band={c.health_band} />
                  </div>

                  {/* Health score */}
                  <div className="flex items-center">
                    <span className="metric-num text-[14.5px]" style={{ color: hColor }}>
                      {c.health_score}
                    </span>
                  </div>

                  {/* Opp score */}
                  <div className="flex items-center">
                    <span className="metric-num text-[14.5px]" style={{ color: tokens.accent }}>
                      {c.opportunity_score}
                    </span>
                  </div>

                  {/* Spend */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>
                        {formatCurrency(c.total_spend)}
                      </div>
                      <div className="text-[10.5px] mt-0.5" style={{ color: tokens.textMuted }}>
                        {c.total_orders} orders
                      </div>
                    </div>
                  </div>

                  {/* Last purchase */}
                  <div className="flex items-center">
                    <div>
                      <div className="text-[12px]" style={{ color: tokens.textSecondary }}>
                        {daysSinceLabel(c.last_purchase_at)}
                      </div>
                      {gap !== null && gap > 30 && (
                        <div className="text-[10.5px] mt-0.5 font-medium" style={{ color: gap > 90 ? '#ff4d6a' : '#ffaa00' }}>
                          {gap}d gap
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    <Pill tone={action.tone} className="!h-6 !text-[10.5px] !px-2.5 group-hover:brightness-110">
                      {action.label}
                      <svg width="8" height="8" fill="none" viewBox="0 0 16 16">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Pill>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {!loading && (
          <div className="mt-4 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: tokens.textMuted }} />
            <span className="text-[11.5px]" style={{ color: tokens.textMuted }}>
              {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
