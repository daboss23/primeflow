'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  getOracleBrief, getRecommendedPlay,
  SIGNAL_STYLE, SYSTEM_STATE_STYLE,
  type OracleSignal,
} from '@/lib/oracle'

// ─── Oracle mark SVG ──────────────────────────────────────────────────────────

export function OracleIcon({ size = 13 }: { size?: number }) {
  const id = `og-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke={`url(#${id})`} strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2" fill={`url(#${id}2)`} />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2"
        stroke={`url(#${id})`} strokeWidth="1.1" strokeLinecap="round" />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#00d4ff" />
        </linearGradient>
        <linearGradient id={`${id}2`} x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Signal card ──────────────────────────────────────────────────────────────

function SignalCard({ signal, highlighted, onEnter, onLeave }: {
  signal: OracleSignal
  highlighted: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const s = SIGNAL_STYLE[signal.type]
  const isCritical = signal.priority === 'critical'

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex-1 rounded-xl p-4 cursor-default transition-all duration-200"
      style={{
        background: highlighted ? s.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${highlighted ? s.border : 'rgba(255,255,255,0.05)'}`,
        transform: highlighted ? 'translateY(-1px)' : 'none',
        boxShadow: highlighted ? `0 4px 20px ${s.color}10` : 'none',
      }}>

      {/* Badge row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-semibold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded"
          style={{ color: s.color, background: s.bg }}>
          {s.label}
        </span>
        {isCritical && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: s.color }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: s.color }} />
          </span>
        )}
      </div>

      {/* Title */}
      <div className="text-[12px] font-semibold leading-snug mb-2"
        style={{ color: highlighted ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.78)' }}>
        {signal.title}
      </div>

      {/* Body */}
      <div className="text-[11px] leading-relaxed mb-3"
        style={{
          color: highlighted ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.36)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
        {signal.body}
      </div>

      {/* Next play */}
      <div className="flex items-start gap-1.5">
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none"
          className="mt-0.5 flex-shrink-0" style={{ color: s.color }}>
          <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] font-medium leading-snug" style={{ color: s.color }}>
          {signal.nextPlay}
        </span>
      </div>
    </div>
  )
}

// ─── Oracle Brief ─────────────────────────────────────────────────────────────

export function OracleBrief() {
  const brief    = getOracleBrief()
  const nextPlay = getRecommendedPlay()
  const stateCfg = SYSTEM_STATE_STYLE[brief.systemState]
  const topSignals = brief.signals.slice(0, 3)

  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div className="mb-6 rounded-2xl relative overflow-hidden oracle-brief-panel"
      style={{
        background: 'rgba(255,255,255,0.018)',
        border: `1px solid ${stateCfg.border}`,
      }}>

      {/* Scan line animation */}
      <div className="oracle-scan-line" style={{ '--scan-color': stateCfg.color } as React.CSSProperties} />

      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-64 h-32 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${stateCfg.color}06 0%, transparent 70%)` }} />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        <div className="flex items-center gap-2.5">
          <OracleIcon size={13} />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase oracle-gradient-text">
            Oracle
          </span>
          <div className="w-px h-3 bg-white/[0.07]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: stateCfg.color }}>
              {stateCfg.label}
            </span>
            {(brief.systemState === 'critical' || brief.systemState === 'watch') && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: stateCfg.color }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: stateCfg.color }} />
              </span>
            )}
          </div>
          <div className="w-px h-3 bg-white/[0.07]" />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {brief.systemSummary}
          </span>
        </div>

        <Link href="/oracle"
          className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
          style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
          Full Intelligence
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Signal cards */}
      <div className="relative flex gap-3 p-4">
        {topSignals.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            highlighted={activeId === signal.id}
            onEnter={() => setActiveId(signal.id)}
            onLeave={() => setActiveId(null)}
          />
        ))}
      </div>

      {/* Next play strip */}
      {nextPlay && (
        <div className="relative flex items-center gap-3 px-5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(167,139,250,0.025)' }}>
          <span className="text-[9px] font-semibold tracking-[0.18em] uppercase flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.22)' }}>
            Next Play
          </span>
          <div className="w-px h-3 bg-white/[0.06] flex-shrink-0" />
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none"
            className="flex-shrink-0" style={{ color: '#a78bfa' }}>
            <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {nextPlay.nextPlay}
          </span>
          <div className="ml-auto flex-shrink-0 flex items-center gap-1.5">
            <span className="text-[9px] font-medium px-2 py-0.5 rounded"
              style={{ color: SIGNAL_STYLE[nextPlay.type].color, background: SIGNAL_STYLE[nextPlay.type].bg }}>
              {nextPlay.targetLabel}
            </span>
            <span className="text-[9px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: 'rgba(255,255,255,0.2)' }}>
              {nextPlay.confidence}% confidence
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
