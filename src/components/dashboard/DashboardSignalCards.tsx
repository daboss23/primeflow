'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { SectionLabel, tokens } from '@/components/ui'

// ─── Types ────────────────────────────────────────────────────────────────────

export type IconType = 'users' | 'alert' | 'dollar' | 'trending' | 'eye' | 'doc' | 'target'

export type SignalCardDef = {
  id:       string
  label:    string
  value:    string
  sub?:     string
  accent:   string
  iconType: IconType
  priority: number
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function SignalIcon({ type, color, pulsing }: { type: IconType; color: string; pulsing: boolean }) {
  const s = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const }
  return (
    <svg width="13" height="13" viewBox="0 0 16 16"
      className={pulsing ? 'icon-signal-pulse' : ''}
      style={{
        opacity: pulsing ? 1 : 0.85,
        ...(pulsing ? { filter: `drop-shadow(0 0 4px ${color}bb)` } : {}),
      }}
      {...s}
    >
      {type === 'users'    && <><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c0-2.6 2.2-4.2 5-4.2s5 1.6 5 4.2"/></>}
      {type === 'alert'    && <><path d="M8 2.5l6 11H2l6-11z"/><path d="M8 7v3"/><circle cx="8" cy="11.7" r="0.5" fill="currentColor"/></>}
      {type === 'dollar'   && <><path d="M11 5.5C11 4.4 9.7 3.5 8 3.5S5 4.4 5 5.5s1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2"/><path d="M8 2.5v11"/></>}
      {type === 'trending' && <><path d="M2 11l5-5 3 3 4-5"/><path d="M11 4h3v3"/></>}
      {type === 'eye'      && <><path d="M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4z"/><circle cx="8" cy="8" r="1.5"/></>}
      {type === 'doc'      && <><path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/></>}
      {type === 'target'   && <><circle cx="8" cy="8" r="5.5"/><path d="M5.5 8l2 2 3-3"/></>}
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardSignalCards({ pool }: { pool: SignalCardDef[] }) {
  const prevIdsRef = useRef<string[]>([])
  const [pulsingIds, setPulsingIds] = useState<string[]>([])

  const cards = useMemo<SignalCardDef[]>(
    () => [...pool].sort((a, b) => b.priority - a.priority).slice(0, 4),
    [pool],
  )

  useEffect(() => {
    const currentIds = cards.map((c: SignalCardDef) => c.id)
    const newIds = currentIds.filter((id: string) => !prevIdsRef.current.includes(id))
    if (newIds.length > 0 && prevIdsRef.current.length > 0) {
      setPulsingIds(newIds)
      const t = setTimeout(() => setPulsingIds([]), 2000)
      prevIdsRef.current = currentIds
      return () => clearTimeout(t)
    }
    prevIdsRef.current = currentIds
  }, [cards])

  return (
    <div className="grid grid-cols-4 gap-5 mb-5">
      {cards.map((card: SignalCardDef) => {
        const pulsing = pulsingIds.includes(card.id)
        return (
          <div
            key={card.id}
            className={`rounded-[14px] border px-6 py-6 ${pulsing ? 'card-signal-pulse' : ''}`}
            style={{
              background:   tokens.surface,
              borderColor:  tokens.borderSubtle,
              boxShadow:    '0 1px 0 rgba(255,255,255,0.055) inset, 0 12px 32px -16px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <SectionLabel>{card.label}</SectionLabel>
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                style={{ background: `${card.accent}14`, color: card.accent, border: `1px solid ${card.accent}26` }}
              >
                <SignalIcon type={card.iconType} color={card.accent} pulsing={pulsing} />
              </div>
            </div>
            <div className="metric-num text-[32px] leading-none" style={{ color: card.accent }}>
              {card.value}
            </div>
            {card.sub && (
              <div className="text-[12.5px] mt-2.5" style={{ color: tokens.textMuted }}>{card.sub}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
