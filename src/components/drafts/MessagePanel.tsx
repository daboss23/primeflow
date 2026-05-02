'use client'

import type { OutreachDraft } from '@/types'
import { Button } from '@/components/ui'

const STATUS_CONFIG = {
  generated: { label: 'Draft ready — review before sending', color: '#a78bfa' },
  approved: { label: '✓ Approved & queued for send', color: '#00e676' },
  queued: { label: '⏳ Queued for send', color: '#ffaa00' },
  sent: { label: '✓ Sent', color: '#00e676' },
  skipped: { label: 'Skipped', color: 'rgba(255,255,255,0.25)' },
  escalated: { label: '⚠ Escalated for human review', color: '#ff6b35' },
}

export function MessagePanel({
  draft,
  onApprove,
  onSkip,
  onEscalate,
  onRegenerate,
  generating,
}: {
  draft: OutreachDraft
  onApprove: () => void
  onSkip: () => void
  onEscalate: () => void
  onRegenerate: () => void
  generating: boolean
}) {
  const config = STATUS_CONFIG[draft.status] ?? STATUS_CONFIG.generated
  const isPending = draft.status === 'generated'
  const isTerminal = ['sent', 'skipped'].includes(draft.status)

  return (
    <div
      className="rounded-xl border p-4 fade-in"
      style={{ borderColor: '#a78bfa33', background: '#a78bfa08' }}
    >
      {/* Status */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[9px] uppercase tracking-[0.12em] font-medium"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <span className="text-[9px] uppercase tracking-[0.1em] text-white/25 capitalize">
          {draft.channel}
        </span>
      </div>

      {/* Subject line (email only) */}
      {draft.subject_line && (
        <div className="mb-2.5 pb-2.5 border-b border-white/[0.06]">
          <span className="text-[9px] text-white/30 uppercase tracking-widest">Subject: </span>
          <span className="text-[12px] text-white/80 font-medium">{draft.subject_line}</span>
        </div>
      )}

      {/* Draft body */}
      <div className="text-[12px] text-white/72 leading-relaxed whitespace-pre-wrap mb-4">
        {draft.draft_text}
      </div>

      {/* Actions */}
      {!isTerminal && (
        <div className="flex gap-2 flex-wrap">
          {isPending && (
            <>
              <Button
                variant="default"
                onClick={onApprove}
                className="flex-1 border-[#00e676]/40 text-[#00e676] hover:bg-[#00e676]/10 hover:border-[#00e676]/60"
              >
                ✓ Approve & Queue
              </Button>
              <Button
                variant="default"
                onClick={onRegenerate}
                disabled={generating}
                className="border-white/[0.1] text-white/45"
              >
                Regenerate
              </Button>
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
              <Button variant="danger" onClick={onEscalate}>
                Escalate
              </Button>
            </>
          )}
          {draft.status === 'approved' && (
            <div className="w-full text-center py-2 rounded-lg bg-[#00e676]/[0.08] border border-[#00e676]/25">
              <span className="text-[12px] text-[#00e676] font-medium">
                ✓ Approved — queued for send
              </span>
            </div>
          )}
          {draft.status === 'escalated' && (
            <div className="w-full text-center py-2 rounded-lg bg-[#ff6b35]/[0.08] border border-[#ff6b35]/25">
              <span className="text-[12px] text-[#ff6b35] font-medium">
                ⚠ Escalated for human review
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
