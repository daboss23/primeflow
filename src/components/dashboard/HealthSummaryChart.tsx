'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { HealthDistribution, StateBreakdown, CustomerState } from '@/types'
import { stateLabel, stateColor } from '@/lib/utils'

// ─── Donut chart ──────────────────────────────────────────────────────────────
export function HealthSummaryChart({ distribution }: { distribution: HealthDistribution }) {
  const { red, yellow, green, total } = distribution

  const data = [
    { name: 'Critical', value: red, color: '#ff4060' },
    { name: 'Watch', value: yellow, color: '#ffaa00' },
    { name: 'Healthy', value: green, color: '#00e676' },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={68}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#0d0d1f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#e8e8f4',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-2xl font-medium text-white"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {total}
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Total</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: d.color, boxShadow: `0 0 4px ${d.color}88` }}
            />
            <span className="text-[10px] text-white/40">
              {d.name} {d.value}
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
