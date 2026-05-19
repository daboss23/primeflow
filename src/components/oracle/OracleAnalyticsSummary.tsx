'use client'

import { getAnalyticsSummary } from '@/lib/oracle'
import { OracleIcon } from './OracleBrief'

export function OracleAnalyticsSummary() {
  const { insight, nextPlay } = getAnalyticsSummary()

  return (
    <div className="flex items-center gap-4 px-5 py-3 rounded-xl mb-6"
      style={{
        background: 'rgba(167,139,250,0.04)',
        border: '1px solid rgba(167,139,250,0.12)',
      }}>

      {/* Oracle mark */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <OracleIcon size={12} />
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase oracle-gradient-text">
          Oracle
        </span>
      </div>

      <div className="w-px h-4 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Insight */}
      <span className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
        {insight}
      </span>

      <div className="w-px h-4 flex-shrink-0 hidden lg:block" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Next play */}
      <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" style={{ color: '#a78bfa' }}>
          <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] font-medium" style={{ color: '#a78bfa' }}>
          {nextPlay}
        </span>
      </div>
    </div>
  )
}
