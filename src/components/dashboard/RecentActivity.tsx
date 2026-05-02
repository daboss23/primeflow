import { supabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

async function getRecentDrafts() {
  const { data } = await supabaseAdmin
    .from('outreach_drafts')
    .select('id, channel, status, generated_at, customer_id')
    .order('generated_at', { ascending: false })
    .limit(6)
  return data ?? []
}

const STATUS_COLOR: Record<string, string> = {
  generated: '#a78bfa',
  approved: '#00d4ff',
  queued: '#ffaa00',
  sent: '#00e676',
  skipped: 'rgba(255,255,255,0.2)',
  escalated: '#ff6b35',
}

export async function RecentActivity() {
  const drafts = await getRecentDrafts()

  if (drafts.length === 0) {
    return (
      <div className="text-[12px] text-white/25 py-6 text-center">
        No outreach activity yet. Generate drafts from the customer list.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {drafts.map((d) => (
        <div
          key={d.id}
          className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: STATUS_COLOR[d.status] ?? '#fff' }}
            />
            <span className="text-[12px] text-white/60 capitalize">
              {d.channel} draft — {d.status}
            </span>
          </div>
          <span className="text-[10px] text-white/25">{formatDate(d.generated_at)}</span>
        </div>
      ))}
    </div>
  )
}
