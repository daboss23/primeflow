'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithHealth, HealthBand, CustomerState } from '@/types'
import { HealthDot, StateBadge, Avatar, Empty, Spinner } from '@/components/ui'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import { fullName, initials, formatCurrency, daysSinceLabel, stateLabel } from '@/lib/utils'

const BANDS: { key: HealthBand | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'red', label: '🔴 Critical' },
  { key: 'yellow', label: '🟡 Watch' },
  { key: 'green', label: '🟢 Healthy' },
]

const STATES: { key: CustomerState | 'all'; label: string }[] = [
  { key: 'all', label: 'All States' },
  { key: 'abandoned_cart', label: 'Abandoned Cart' },
  { key: 'failed_payment', label: 'Failed Payment' },
  { key: 'dormant_buyer', label: 'Dormant Buyer' },
  { key: 'repeat_at_risk', label: 'VIP at Risk' },
  { key: 'replenishment', label: 'Replenishment' },
  { key: 'engaged_unconverted', label: 'Engaged, Not Converted' },
]

export function CustomerListView({
  initialBand,
  initialState,
}: {
  initialBand: HealthBand | null
  initialState: CustomerState | null
}) {
  const [customers, setCustomers] = useState<CustomerWithHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [band, setBand] = useState<HealthBand | 'all'>(initialBand ?? 'all')
  const [state, setState] = useState<CustomerState | 'all'>(initialState ?? 'all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (band !== 'all') params.set('band', band)
    if (state !== 'all') params.set('state', state)

    const res = await fetch(`/api/customers?${params}`)
    const data = await res.json()
    const list: CustomerWithHealth[] = data.customers ?? []
    setCustomers(list)
    if (list.length > 0 && !selectedId) setSelectedId(list[0].customer_id)
    setLoading(false)
  }, [band, state]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const selected = customers.find((c) => c.customer_id === selectedId)

  return (
    <>
      {/* Left pane — list */}
      <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-white/[0.06] h-full">
        {/* Filters */}
        <div className="px-4 py-3 border-b border-white/[0.05] space-y-2 flex-shrink-0">
          {/* Band filter */}
          <div className="flex gap-1.5 flex-wrap">
            {BANDS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setBand(key as HealthBand | 'all')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                  band === key
                    ? key === 'red'
                      ? 'bg-red-500/15 border-red-500/60 text-red-400'
                      : key === 'yellow'
                      ? 'bg-yellow-500/15 border-yellow-500/60 text-yellow-400'
                      : key === 'green'
                      ? 'bg-green-500/15 border-green-500/60 text-green-400'
                      : 'bg-white/[0.07] border-white/25 text-white'
                    : 'border-white/[0.08] text-white/35 hover:text-white/65 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* State filter */}
          <select
            value={state}
            onChange={(e) => setState(e.target.value as CustomerState | 'all')}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white/60 outline-none focus:border-white/20"
          >
            {STATES.map(({ key, label }) => (
              <option key={key} value={key} className="bg-[#0d0d1f]">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-white/30">
              <Spinner size={14} /> Loading...
            </div>
          ) : customers.length === 0 ? (
            <Empty message="No customers match this filter" />
          ) : (
            customers.map((c) => {
              const isSel = c.customer_id === selectedId
              return (
                <button
                  key={c.customer_id}
                  onClick={() => setSelectedId(c.customer_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] transition-all text-left relative ${
                    isSel
                      ? 'bg-[#00d4ff]/[0.05]'
                      : 'hover:bg-white/[0.025]'
                  }`}
                >
                  {isSel && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00d4ff] rounded-r" />
                  )}
                  <Avatar
                    initials={initials(c.first_name, c.last_name)}
                    band={c.health_band}
                    size={34}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white/90 truncate">
                      {fullName(c.first_name, c.last_name)}
                    </div>
                    <div className="text-[10px] text-white/35 mt-0.5 truncate">
                      {stateLabel(c.state)} · {daysSinceLabel(c.last_purchase_at)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <HealthDot band={c.health_band} size={7} />
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        fontFamily: 'var(--font-jetbrains)',
                        color:
                          c.health_band === 'red'
                            ? '#ff4060'
                            : c.health_band === 'yellow'
                            ? '#ffaa00'
                            : '#00e676',
                      }}
                    >
                      {c.opportunity_score}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer count */}
        <div className="px-4 py-2.5 border-t border-white/[0.05] flex-shrink-0">
          <span className="text-[10px] text-white/25">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Right pane — detail */}
      <div className="flex-1 overflow-y-auto h-full">
        {selected ? (
          <CustomerDetail customer={selected} onRefresh={fetchCustomers} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 text-[13px]">
            Select a customer to view details
          </div>
        )}
      </div>
    </>
  )
}
