'use client'

import { useState, useMemo } from 'react'

const INDUSTRY_BENCHMARKS: Record<string, {
  label: string
  abandoned_cart_rate: number
  dormant_rate: number
  replenishment_miss_rate: number
  cart_recovery_rate: number
  dormant_recovery_rate: number
}> = {
  supplements: {
    label: 'Supplements / Health',
    abandoned_cart_rate: 0.68, dormant_rate: 0.30, replenishment_miss_rate: 0.25,
    cart_recovery_rate: 0.14, dormant_recovery_rate: 0.10,
  },
  skincare: {
    label: 'Skincare / Beauty',
    abandoned_cart_rate: 0.72, dormant_rate: 0.38, replenishment_miss_rate: 0.28,
    cart_recovery_rate: 0.13, dormant_recovery_rate: 0.09,
  },
  apparel: {
    label: 'Apparel / Fashion',
    abandoned_cart_rate: 0.76, dormant_rate: 0.42, replenishment_miss_rate: 0.15,
    cart_recovery_rate: 0.11, dormant_recovery_rate: 0.07,
  },
  coffee: {
    label: 'Coffee / Food',
    abandoned_cart_rate: 0.65, dormant_rate: 0.28, replenishment_miss_rate: 0.40,
    cart_recovery_rate: 0.15, dormant_recovery_rate: 0.12,
  },
  homewares: {
    label: 'Homewares / Lifestyle',
    abandoned_cart_rate: 0.74, dormant_rate: 0.45, replenishment_miss_rate: 0.10,
    cart_recovery_rate: 0.10, dormant_recovery_rate: 0.07,
  },
  pet: {
    label: 'Pet Products',
    abandoned_cart_rate: 0.66, dormant_rate: 0.25, replenishment_miss_rate: 0.45,
    cart_recovery_rate: 0.16, dormant_recovery_rate: 0.11,
  },
  general: {
    label: 'General / Other',
    abandoned_cart_rate: 0.70, dormant_rate: 0.35, replenishment_miss_rate: 0.30,
    cart_recovery_rate: 0.12, dormant_recovery_rate: 0.08,
  },
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

function calculate(monthly_customers: number, aov: number, monthly_revenue: number, industry: string): Results {
  const B = INDUSTRY_BENCHMARKS[industry] ?? INDUSTRY_BENCHMARKS.general

  const states = [
    { label: 'Abandoned Carts', color: '#ff4060', customers: Math.round(monthly_customers * 0.3 * B.abandoned_cart_rate), loss_per_customer: aov, recovery_rate: B.cart_recovery_rate },
    { label: 'Failed Payments', color: '#ff6b35', customers: Math.round(monthly_customers * 0.4 * 0.05), loss_per_customer: aov, recovery_rate: 0.40 },
    { label: 'Dormant Buyers', color: '#cc3355', customers: Math.round(monthly_customers * B.dormant_rate), loss_per_customer: aov * 0.6, recovery_rate: B.dormant_recovery_rate },
    { label: 'VIP Customers at Risk', color: '#ffaa00', customers: Math.round(monthly_customers * 0.15 * 0.20), loss_per_customer: aov * 2.2, recovery_rate: 0.15 },
    { label: 'Replenishment Missed', color: '#00ccff', customers: Math.round(monthly_customers * 0.2 * B.replenishment_miss_rate), loss_per_customer: aov, recovery_rate: 0.25 },
    { label: 'Engaged, Not Converted', color: '#a78bfa', customers: Math.round(monthly_customers * 0.25 * 0.15), loss_per_customer: aov * 0.8, recovery_rate: 0.06 },
  ]

  const by_state = states.map(s => ({
    label: s.label, color: s.color, customers: s.customers,
    at_risk: Math.round(s.customers * s.loss_per_customer),
    recoverable: Math.round(s.customers * s.loss_per_customer * s.recovery_rate),
  }))

  const total_at_risk = by_state.reduce((s, r) => s + r.at_risk, 0)
  const total_recoverable = by_state.reduce((s, r) => s + r.recoverable, 0)

  return { total_at_risk, total_recoverable, by_state, monthly_recoverable: total_recoverable, annual_recoverable: total_recoverable * 12 }
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

const INDUSTRIES = [
  { key: 'supplements', label: 'Supplements / Health' },
  { key: 'skincare', label: 'Skincare / Beauty' },
  { key: 'apparel', label: 'Apparel / Fashion' },
  { key: 'coffee', label: 'Coffee / Food' },
  { key: 'homewares', label: 'Homewares / Lifestyle' },
  { key: 'pet', label: 'Pet Products' },
  { key: 'general', label: 'General / Other' },
]

export function RevenueCalculator() {
  const [monthly_customers, setMonthlyCustomers] = useState(2000)
  const [aov, setAov] = useState(85)
  const [monthly_revenue, setMonthlyRevenue] = useState(170000)
  const [industry, setIndustry] = useState('general')
  const [store_url, setStoreUrl] = useState('')
  const [current_recovery, setCurrentRecovery] = useState(0)
  const [email, setEmail] = useState('')
  const [shown, setShown] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const results = useMemo(
    () => calculate(monthly_customers, aov, monthly_revenue, industry),
    [monthly_customers, aov, monthly_revenue, industry]
  )

  const maxAt = Math.max(...results.by_state.map(s => s.at_risk), 1)
  const roi = Math.round(results.monthly_recoverable / 300)

  const handleSaveReport = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || null,
          store_url: store_url || null,
          industry,
          monthly_customers,
          aov,
          monthly_revenue,
          current_recovery,
          total_at_risk: results.total_at_risk,
          total_recoverable: results.total_recoverable,
          results_json: results,
        }),
      })
      const data = await res.json()
      if (data.id) setShareUrl(`${window.location.origin}/report/${data.id}`)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-5">

      {/* Store + Industry */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-5">Your Store</div>

        <div className="mb-5">
          <label className="text-[13px] font-medium text-white/80 block mb-2">
            Shopify store URL <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="yourstore.myshopify.com"
            value={store_url}
            onChange={e => setStoreUrl(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-[#00d4ff]/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-[13px] font-medium text-white/80 block mb-2">Your category</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button
                key={ind.key}
                onClick={() => setIndustry(ind.key)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                  industry === ind.key
                    ? 'bg-[#7c3aed]/20 border-[#7c3aed]/60 text-[#a78bfa]'
                    : 'border-white/[0.08] text-white/45 hover:text-white/75 hover:border-white/20'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-5">Your Store Numbers</div>
        <div className="space-y-6">

          <SliderField
            label="Monthly active customers"
            hint="Total customers who've purchased in the last 12 months"
            value={monthly_customers} min={100} max={50000} step={100}
            display={monthly_customers.toLocaleString()}
            onChange={setMonthlyCustomers}
          />

          <SliderField
            label="Average order value"
            hint="Your typical order size"
            value={aov} min={20} max={500} step={5}
            display={fmt(aov)}
            onChange={setAov}
          />

          <SliderField
            label="Monthly revenue"
            hint="Approximate monthly store revenue"
            value={monthly_revenue} min={5000} max={2000000} step={5000}
            display={fmt(monthly_revenue)}
            onChange={setMonthlyRevenue}
          />

          <SliderField
            label="Currently recovering per month"
            hint="From win-back campaigns, cart recovery tools, etc. (0 if none)"
            value={current_recovery} min={0} max={50000} step={100}
            display={fmt(current_recovery)}
            onChange={setCurrentRecovery}
          />

        </div>

        <button
          onClick={() => setShown(true)}
          className="mt-6 w-full py-3 rounded-xl font-semibold text-[15px] text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}
        >
          Calculate My Revenue Gap →
        </button>
      </div>

      {/* Results */}
      {shown && (
        <div className="space-y-4">

          {/* Hero numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-6">
              <div className="text-[11px] uppercase tracking-[0.12em] text-red-400 mb-2">Revenue at Risk This Month</div>
              <div className="text-[36px] font-bold text-red-400">{fmt(results.total_at_risk)}</div>
              <div className="text-[12px] text-white/40 mt-1">Sitting in leaking buckets right now</div>
            </div>
            <div className="rounded-xl border border-[#00e676]/25 bg-[#00e676]/[0.06] p-6">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#00e676] mb-2">Recoverable With Smart Outreach</div>
              <div className="text-[36px] font-bold text-[#00e676]">{fmt(results.monthly_recoverable)}</div>
              <div className="text-[12px] text-white/40 mt-1">Per month · {fmt(results.annual_recoverable)} per year</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-5">
              Revenue Gap Breakdown — {INDUSTRY_BENCHMARKS[industry]?.label}
            </div>
            <div className="space-y-4">
              {results.by_state.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}88` }} />
                      <span className="text-[13px] text-white/80">{s.label}</span>
                      <span className="text-[11px] text-white/35">~{s.customers.toLocaleString()} customers</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-medium text-white/70">{fmt(s.at_risk)}</span>
                      <span className="text-[11px] text-[#00e676] ml-2">→ {fmt(s.recoverable)}</span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full score-bar-fill" style={{ width: `${(s.at_risk / maxAt) * 100}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI — centred */}
          <div className="rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[#a78bfa] mb-5 text-center">
              Revenue Recovery Engine ROI
            </div>
            <div className="flex justify-center items-center gap-16">
              <div className="text-center">
                <div className="text-[32px] font-bold text-[#00e676]">{fmt(results.monthly_recoverable)}</div>
                <div className="text-[11px] text-white/35 mt-1">Recovered/mo</div>
              </div>
              <div className="text-center">
                <div className="text-[32px] font-bold text-[#00d4ff]">{roi}x</div>
                <div className="text-[11px] text-white/35 mt-1">Return on investment</div>
              </div>
            </div>
          </div>

          {/* What this means */}
          <div className="rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[#00d4ff] mb-3">What This Means</div>
            <p className="text-[14px] text-white/70 leading-relaxed">
              You&apos;re currently recovering{' '}
              <strong className="text-[#ffaa00]">{fmt(current_recovery)}</strong> per month.
              The Recovery Engine could potentially recover{' '}
              <strong className="text-[#00e676]">{fmt(results.monthly_recoverable)}</strong> per month
              {' '}— that&apos;s an extra{' '}
              <strong className="text-white">{fmt(Math.max(0, results.monthly_recoverable - current_recovery))}</strong>{' '}
              left on the table every month.
            </p>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="text-[11px] text-white/35">
                * Estimates based on published DTC ecommerce benchmarks. Actual results vary by brand, category, and outreach quality.
              </div>
            </div>
          </div>

          {/* Save & share */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="text-[14px] font-semibold text-white mb-1">Save &amp; share your report</div>
            <div className="text-[12px] text-white/40 mb-4">Get a shareable link to send to your team, investors, or agency.</div>
            <div className="flex gap-3 mb-4">
              <input
                type="email"
                placeholder="your@email.com (optional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-[#00d4ff]/40 transition-colors"
              />
              <button
                onClick={handleSaveReport}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}
              >
                {saving ? 'Saving...' : 'Get Link →'}
              </button>
            </div>
            {shareUrl && (
              <div className="rounded-lg border border-[#00e676]/20 bg-[#00e676]/[0.04] p-4">
                <div className="text-[12px] text-[#00e676] mb-3">✓ Report saved — share this link</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-[12px] text-white/50 font-mono truncate">{shareUrl}</div>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-white/[0.12] text-white/60 hover:text-white/90 transition-all whitespace-nowrap"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all whitespace-nowrap"
                  >
                    View →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          
        </div>
      )}
    </div>
  )
}

function SliderField({ label, hint, value, min, max, step, display, onChange }: {
  label: string; hint: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <div className="text-[14px] font-medium text-white/90">{label}</div>
          <div className="text-[11px] text-white/35 mt-0.5">{hint}</div>
        </div>
        <div className="text-[20px] font-medium text-[#00d4ff]" style={{ fontFamily: 'var(--font-jetbrains)' }}>
          {display}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full" style={{ accentColor: '#00d4ff' }}
      />
      <div className="flex justify-between text-[10px] text-white/25 mt-1">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  )
}
