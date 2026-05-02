'use client'

import { useState, useMemo } from 'react'

// ─── Industry benchmarks ──────────────────────────────────────────────────────
// Based on published ecommerce averages across DTC brands

const BENCHMARKS = {
  abandoned_cart_rate: 0.70,
  failed_payment_rate: 0.05,
  dormant_rate: 0.35,
  repeat_at_risk_rate: 0.20,
  replenishment_miss_rate: 0.30,
  engaged_unconverted_rate: 0.15,

  cart_recovery_rate: 0.12,
  payment_recovery_rate: 0.40,
  dormant_recovery_rate: 0.08,
  repeat_recovery_rate: 0.15,
  replenishment_recovery_rate: 0.25,
  engaged_conversion_rate: 0.06,
}

interface Results {
  total_at_risk: number
  total_recoverable: number
  by_state: {
    label: string
    at_risk: number
    recoverable: number
    color: string
    customers: number
  }[]
  monthly_recoverable: number
  annual_recoverable: number
}

function calculate(
  monthly_customers: number,
  aov: number,
  monthly_revenue: number
): Results {
  const B = BENCHMARKS

  const states = [
    {
      label: 'Abandoned Carts',
      color: '#ff4060',
      customers: Math.round(monthly_customers * 0.3 * B.abandoned_cart_rate),
      loss_per_customer: aov,
      recovery_rate: B.cart_recovery_rate,
    },
    {
      label: 'Failed Payments',
      color: '#ff6b35',
      customers: Math.round(monthly_customers * 0.4 * B.failed_payment_rate),
      loss_per_customer: aov,
      recovery_rate: B.payment_recovery_rate,
    },
    {
      label: 'Dormant Buyers',
      color: '#cc3355',
      customers: Math.round(monthly_customers * B.dormant_rate),
      loss_per_customer: aov * 0.6,
      recovery_rate: B.dormant_recovery_rate,
    },
    {
      label: 'VIP Customers at Risk',
      color: '#ffaa00',
      customers: Math.round(monthly_customers * 0.15 * B.repeat_at_risk_rate),
      loss_per_customer: aov * 2.2,
      recovery_rate: B.repeat_recovery_rate,
    },
    {
      label: 'Replenishment Missed',
      color: '#00ccff',
      customers: Math.round(monthly_customers * 0.2 * B.replenishment_miss_rate),
      loss_per_customer: aov,
      recovery_rate: B.replenishment_recovery_rate,
    },
    {
      label: 'Engaged, Not Converted',
      color: '#a78bfa',
      customers: Math.round(monthly_customers * 0.25 * B.engaged_unconverted_rate),
      loss_per_customer: aov * 0.8,
      recovery_rate: B.engaged_conversion_rate,
    },
  ]

  const by_state = states.map(s => ({
    label: s.label,
    color: s.color,
    customers: s.customers,
    at_risk: Math.round(s.customers * s.loss_per_customer),
    recoverable: Math.round(s.customers * s.loss_per_customer * s.recovery_rate),
  }))

  const total_at_risk = by_state.reduce((s, r) => s + r.at_risk, 0)
  const total_recoverable = by_state.reduce((s, r) => s + r.recoverable, 0)

  return {
    total_at_risk,
    total_recoverable,
    by_state,
    monthly_recoverable: total_recoverable,
    annual_recoverable: total_recoverable * 12,
  }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

export function RevenueCalculator() {
  const [monthly_customers, setMonthlyCustomers] = useState(2000)
  const [aov, setAov] = useState(85)
  const [monthly_revenue, setMonthlyRevenue] = useState(170000)
  const [shown, setShown] = useState(false)

  const results = useMemo(
    () => calculate(monthly_customers, aov, monthly_revenue),
    [monthly_customers, aov, monthly_revenue]
  )

  const maxAt = Math.max(...results.by_state.map(s => s.at_risk))

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-5">
          Your Store Numbers
        </div>
        <div className="grid grid-cols-1 gap-6">

          <SliderField
            label="Monthly active customers"
            hint="Total customers who've purchased in the last 12 months"
            value={monthly_customers}
            min={100} max={50000} step={100}
            display={monthly_customers.toLocaleString()}
            onChange={setMonthlyCustomers}
          />

          <SliderField
            label="Average order value"
            hint="Your typical order size"
            value={aov}
            min={20} max={500} step={5}
            display={fmt(aov)}
            onChange={setAov}
          />

          <SliderField
            label="Monthly revenue"
            hint="Approximate monthly store revenue"
            value={monthly_revenue}
            min={5000} max={2000000} step={5000}
            display={fmt(monthly_revenue)}
            onChange={setMonthlyRevenue}
          />

        </div>

        <button
          onClick={() => setShown(true)}
          className="mt-6 w-full py-3 rounded-xl font-semibold text-[15px] text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}
        >
          Calculate My Revenue Gap →
        </button>
      </div>

      {shown && (
        <div className="space-y-4 fade-in">

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-5">
              <div className="text-[11px] uppercase tracking-[0.12em] text-red-400 mb-2">
                Revenue at Risk This Month
              </div>
              <div className="text-[32px] font-bold text-red-400">
                {fmt(results.total_at_risk)}
              </div>
              <div className="text-[12px] text-white/40 mt-1">
                Sitting in leaking buckets right now
              </div>
            </div>
            <div className="rounded-xl border border-[#00e676]/25 bg-[#00e676]/[0.06] p-5">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#00e676] mb-2">
                Recoverable With Smart Outreach
              </div>
              <div className="text-[32px] font-bold text-[#00e676]">
                {fmt(results.monthly_recoverable)}
              </div>
              <div className="text-[12px] text-white/40 mt-1">
                Per month · {fmt(results.annual_recoverable)} per year
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-5">
              Revenue Gap Breakdown
            </div>
            <div className="space-y-4">
              {results.by_state.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.color, boxShadow: `0 0 4px ${s.color}88` }}
                      />
                      <span className="text-[13px] text-white/80">{s.label}</span>
                      <span className="text-[11px] text-white/35">
                        ~{s.customers.toLocaleString()} customers
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-medium text-white/70">{fmt(s.at_risk)}</span>
                      <span className="text-[11px] text-[#00e676] ml-2">
                        → {fmt(s.recoverable)}
                      </span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full score-bar-fill"
                      style={{
                        width: maxAt > 0 ? `${(s.at_risk / maxAt) * 100}%` : '0%',
                        background: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[#00d4ff] mb-3">
              What This Means
            </div>
            <p className="text-[14px] text-white/70 leading-relaxed">
              Based on industry benchmarks, your store is likely leaving{' '}
              <strong className="text-white">{fmt(results.total_at_risk)}</strong> on the table
              every month. With intelligent one-to-one outreach, the Revenue Recovery Engine
              can realistically recover{' '}
              <strong className="text-[#00e676]">{fmt(results.monthly_recoverable)}</strong> of
              that — from customers you already paid to acquire.
            </p>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="text-[11px] text-white/35">
                * Estimates based on published DTC ecommerce benchmarks. Actual results vary by
                brand, category, and outreach quality.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function SliderField({
  label, hint, value, min, max, step, display, onChange
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <div className="text-[14px] font-medium text-white/90">{label}</div>
          <div className="text-[11px] text-white/35 mt-0.5">{hint}</div>
        </div>
        <div
          className="text-[20px] font-medium text-[#00d4ff]"
          style={{ fontFamily: 'var(--font-jetbrains)' }}
        >
          {display}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: '#00d4ff' }}
      />
      <div className="flex justify-between text-[10px] text-white/25 mt-1">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  )
}