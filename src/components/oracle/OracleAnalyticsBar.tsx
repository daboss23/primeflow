'use client'

interface OracleAnalyticsBarProps {
  activeRange: string
}

const INSIGHTS: Record<string, { signal: string; nextPlay: string }> = {
  'This Month': {
    signal:   'Abandoned Cart Recovery is outperforming all other workflows this period — 41% of recovered revenue.',
    nextPlay: 'Expand Abandoned Cart enrollment or increase sequence frequency to compound this advantage.',
  },
  'Last 30 Days': {
    signal:   'VIP Retention is trending at +28% — the strongest momentum signal in the current dataset.',
    nextPlay: 'Prioritise VIP At-Risk Retention now while the recovery window is strongest.',
  },
  'Quarter': {
    signal:   'Dormant Win-Back is showing diminishing returns quarter-over-quarter. Conversion rate slipping.',
    nextPlay: 'Refresh win-back messaging and test a new offer angle — current sequence may have audience fatigue.',
  },
  'Custom Range': {
    signal:   'Extended range shows consistent Abandoned Cart dominance. All other workflows are significantly behind.',
    nextPlay: 'Investigate why Replenishment and Engaged-Not-Converted remain underperforming — activation gap likely.',
  },
}

export function OracleAnalyticsBar({ activeRange }: OracleAnalyticsBarProps) {
  const insight = INSIGHTS[activeRange] ?? INSIGHTS['This Month']

  return (
    <div
      className="flex items-start gap-3 mb-6 px-4 py-3 rounded-xl oracle-signal-in"
      style={{
        background: 'rgba(0,212,255,0.02)',
        border:     '1px solid rgba(0,212,255,0.1)',
      }}
    >
      {/* Oracle node */}
      <div className="relative w-3.5 h-3.5 flex-shrink-0 mt-0.5">
        <div className="absolute inset-0 rounded-full oracle-ring-1"
          style={{ border: '1px solid rgba(0,212,255,0.4)' }} />
        <div className="absolute inset-[2.5px] rounded-full"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, #8b5cf6 100%)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-bold tracking-[0.22em] uppercase"
            style={{ color: 'rgba(0,212,255,0.6)' }}>Oracle Signal</span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 9 }}>·</span>
          <span className="text-[9px] tracking-[0.1em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}>{activeRange}</span>
        </div>
        <div className="text-[12px] leading-snug text-white/70">
          {insight.signal}
        </div>
      </div>

      <div className="flex items-start gap-1.5 flex-shrink-0 max-w-[280px]">
        <svg width="8" height="8" fill="none" viewBox="0 0 8 8" className="mt-1 flex-shrink-0">
          <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke="#00d4ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[10px] leading-relaxed" style={{ color: 'rgba(0,212,255,0.6)' }}>
          {insight.nextPlay}
        </span>
      </div>
    </div>
  )
}
