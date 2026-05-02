'use client'

import type { StateBreakdown, CustomerState } from '@/types'
import { stateLabel, stateColor } from '@/lib/utils'

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
