import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { AnalyticsSummary, CustomerState, DraftChannel } from '@/types'

export async function GET() {
  try {
    // Health distribution from latest scores
    const { data: health } = await supabaseAdmin
      .from('current_customer_health')
      .select('health_band, state, opportunity_score, total_spend, average_order_value')

    const red = health?.filter((r) => r.health_band === 'red').length ?? 0
    const yellow = health?.filter((r) => r.health_band === 'yellow').length ?? 0
    const green = health?.filter((r) => r.health_band === 'green').length ?? 0
    const total = health?.length ?? 0

    // At-risk revenue: sum of AOV for red customers
    const at_risk_revenue =
      health
        ?.filter((r) => r.health_band === 'red')
        .reduce((sum, r) => sum + (r.average_order_value ?? 0), 0) ?? 0

    // Draft stats
    const { data: drafts } = await supabaseAdmin
      .from('outreach_drafts')
      .select('status, channel')

    const drafts_generated = drafts?.length ?? 0
    const drafts_approved =
      drafts?.filter((d) => ['approved', 'queued', 'sent'].includes(d.status)).length ?? 0
    const drafts_sent = drafts?.filter((d) => d.status === 'sent').length ?? 0

    // Outcomes
    const { data: outcomes } = await supabaseAdmin
      .from('outcomes')
      .select('outcome_type, revenue_value')

    const replies = outcomes?.filter((o) => o.outcome_type === 'replied').length ?? 0
    const purchases = outcomes?.filter((o) => o.outcome_type === 'purchased').length ?? 0
    const recovered_revenue =
      outcomes
        ?.filter((o) => o.outcome_type === 'purchased')
        .reduce((sum, o) => sum + (o.revenue_value ?? 0), 0) ?? 0

    const reply_rate = drafts_sent > 0 ? replies / drafts_sent : 0
    const conversion_rate = drafts_sent > 0 ? purchases / drafts_sent : 0

    // Breakdown by state
    const states: CustomerState[] = [
      'abandoned_cart',
      'failed_payment',
      'dormant_buyer',
      'repeat_at_risk',
      'replenishment',
      'engaged_unconverted',
    ]

    const by_state = states.map((state) => ({
      state,
      count: health?.filter((r) => r.state === state).length ?? 0,
      converted: 0, // Phase 2: join with outcomes
      revenue: 0,
    }))

    // Channel breakdown
    const channels: DraftChannel[] = ['email', 'sms']
    const outreach_by_channel = channels.map((channel) => ({
      channel,
      sent: drafts?.filter((d) => d.channel === channel && d.status === 'sent').length ?? 0,
      replied: 0, // Phase 2: join with outcomes by channel
      converted: 0,
    }))

    const summary: AnalyticsSummary = {
      health_distribution: { red, yellow, green, total },
      at_risk_revenue,
      drafts_generated,
      drafts_approved,
      drafts_sent,
      reply_rate,
      conversion_rate,
      recovered_revenue,
      by_state,
      outreach_by_channel,
    }

    return NextResponse.json(summary)
  } catch (err) {
    console.error('[analytics GET]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
