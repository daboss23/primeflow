'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { HealthDistribution, StateBreakdown, CustomerState } from '@/types'
import { stateLabel, stateColor } from '@/lib/utils'

// ─── Donut chart ──────────────────────────────────────────────────────────────
export function HealthSummaryChart({ distribution }: { distribution: HealthDistribution }) {
  const { red, yellow, green, total } = distribution

  const data = [
    { name: 'Critical', value: red,    color: '#ff4d6a' },
    { name: 'Watch',    value: yellow, color: '#ffaa00' },
    { name: 'Healthy',  value: green,  color: '#3ddc97' },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full" style={{ height: 168 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(15,15,25,0.96)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.95)',
                fontSize: 12,
                boxShadow: '0 12px 32px -8px rgba(0,0,0,0.6)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="metric-num text-[28px] leading-none" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {total}
          </div>
          <div className="eyebrow mt-1.5" style={{ fontSize: 9.5 }}>Total</div>
        </div>
      </div>

      <div className="flex gap-5 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: d.color, boxShadow: `0 0 5px ${d.color}aa` }}
            />
            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {d.name}
            </span>
            <span className="metric-num text-[11px]" style={{ color: d.color }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── State breakdown list ─────────────────────────────────────────────────────
const STATE_ORDER: CustomerState[] = [
  'abandoned_cart',
  'failed_payment',
  'repeat_at_risk',
  'dormant_buyer',
  'replenishment',
  'engaged_unconverted',
]

export function StateBreakdownList({
  states,
  total,
}: {
  states: StateBreakdown[]
  total: number
}) {
  const sorted = STATE_ORDER.map((s) => states.find((st) => st.state === s)).filter(
    Boolean
  ) as StateBreakdown[]

  return (
    <div className="space-y-2.5">
      {sorted.map((s) => {
        const pct = total > 0 ? (s.count / total) * 100 : 0
        const color = stateColor(s.state)
        return (
          <div key={s.state}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-white/60">{stateLabel(s.state)}</span>
              <span
                className="text-[11px] font-medium"
                style={{ fontFamily: 'var(--font-jetbrains)', color }}
              >
                {s.count}
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full score-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
