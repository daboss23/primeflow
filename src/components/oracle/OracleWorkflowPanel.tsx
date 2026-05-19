'use client'

import { useEffect } from 'react'

interface OracleWorkflowPanelProps {
  onHighlight: (ids: string[]) => void
}

const SIGNALS = [
  {
    workflowIds: ['4'],
    severity:    'critical' as const,
    title:       'VIP Retention is paused — customers going cold',
    body:        '17 enrolled VIP customers are stalled. This workflow generates the highest revenue per conversion of any active sequence.',
    nextPlay:    'Resume VIP At-Risk Retention now.',
    accentColor: '#f59e0b',
  },
  {
    workflowIds: ['1'],
    severity:    'high' as const,
    title:       'Abandoned Cart at 22% conversion — below benchmark',
    body:        '111 of 142 enrolled customers have not converted. Expected benchmark is 30–35%.',
    nextPlay:    'Audit step 2 timing and subject line — most drop-off occurs in the first 6 hours.',
    accentColor: '#ff6b6b',
  },
  {
    workflowIds: ['6'],
    severity:    'medium' as const,
    title:       '"Engaged, Not Converted" is inactive',
    body:        'Zero customers enrolled. High-intent browsers are among the highest-ROI conversion targets available.',
    nextPlay:    'Activate this workflow — expected lift of 18–22% at minimal outreach cost.',
    accentColor: '#8b5cf6',
  },
]

const ALL_FLAGGED_IDS = SIGNALS.flatMap(s => s.workflowIds)

export function OracleWorkflowPanel({ onHighlight }: OracleWorkflowPanelProps) {
  useEffect(() => {
    onHighlight(ALL_FLAGGED_IDS)
  }, [onHighlight])

  return (
    <div
      className="mb-5 rounded-xl overflow-hidden oracle-signal-in"
      style={{ border: '1px solid rgba(0,212,255,0.1)', background: 'linear-gradient(135deg, rgba(0,212,255,0.025) 0%, rgba(130,60,255,0.01) 100%)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}
      >
        <div className="relative w-3.5 h-3.5 flex-shrink-0">
          <div className="absolute inset-0 rounded-full oracle-ring-1"
            style={{ border: '1px solid rgba(0,212,255,0.45)' }} />
          <div className="absolute inset-[2.5px] rounded-full"
            style={{ background: 'radial-gradient(circle, #00d4ff 0%, #8b5cf6 100%)' }} />
        </div>
        <span className="text-[9px] font-bold tracking-[0.24em] uppercase"
          style={{ color: 'rgba(0,212,255,0.6)' }}>Oracle · Workflow Intelligence</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full pulse-dot"
            style={{ background: '#00e676', boxShadow: '0 0 4px #00e676' }} />
          <span className="text-[9px] tracking-[0.1em] uppercase"
            style={{ color: 'rgba(255,255,255,0.2)' }}>3 signals active</span>
        </div>
      </div>

      {/* Signals row */}
      <div className="grid grid-cols-3">
        {SIGNALS.map((sig, i) => (
          <div
            key={i}
            className="px-4 py-3"
            style={{ borderRight: i < SIGNALS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <div className="flex items-start gap-2 mb-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full mt-[3px] flex-shrink-0"
                style={{ background: sig.accentColor, boxShadow: `0 0 5px ${sig.accentColor}88` }}
              />
              <span className="text-[11px] font-semibold leading-snug"
                style={{ color: 'rgba(255,255,255,0.72)' }}>{sig.title}</span>
            </div>
            <div className="text-[10px] leading-relaxed mb-2 pl-3.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              {sig.body}
            </div>
            <div className="flex items-start gap-1.5 pl-3.5">
              <svg width="8" height="8" fill="none" viewBox="0 0 8 8" className="mt-0.5 flex-shrink-0">
                <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke={sig.accentColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px]" style={{ color: sig.accentColor + 'cc' }}>
                {sig.nextPlay}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
