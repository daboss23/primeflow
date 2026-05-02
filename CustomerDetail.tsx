'use client'

import { useState } from 'react'
import type { CustomerWithHealth, OutreachDraft } from '@/types'
import {
  Avatar, StateBadge, ScoreBar, InfoRow,
  SectionLabel, Card, Button, Spinner,
} from '@/components/ui'
import { fullName, initials, formatCurrency, daysSinceLabel, bandColor } from '@/lib/utils'
import { MessagePanel } from '@/components/drafts/MessagePanel'

export function CustomerDetail({
  customer,
  onRefresh,
}: {
  customer: CustomerWithHealth
  onRefresh: () => void
}) {
  const [draft, setDraft] = useState<OutreachDraft | null>(null)
  const [channel, setChannel] = useState<'email' | 'sms'>('email')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const name = fullName(customer.first_name, customer.last_name)
  const ini = initials(customer.first_name, customer.last_name)
  const hColor = bandColor(customer.health_band)

  const generateDraft = async () => {
    setGenerating(true)
    setDraft(null)
    setError(null)
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.customer_id, channel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Check your Anthropic API key in .env.local')
        return
      }
      if (data.draft) setDraft(data.draft)
    } catch (e) {
      setError('Could not reach the server. Make sure the app is running.')
    } finally {
      setGenerating(false)
    }
  }

  const updateDraftStatus = async (status: 'approved' | 'skipped' | 'escalated') => {
    if (!draft) return
    const res = await fetch('/api/draft', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft_id: draft.id, status }),
    })
    const data = await res.json()
    if (data.draft) setDraft(data.draft)
  }

  return (
    <div className="p-6 max-w-[640px] fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar initials={ini} band={customer.health_band} size={46} />
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-semibold text-white">{name}</h2>
          <p className="text-[11px] text-white/35 mt-0.5">{customer.email}</p>
          <div className="mt-2"><StateBadge state={customer.state} /></div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card><ScoreBar value={customer.health_score} color={hColor} label="Health Score" /></Card>
        <Card><ScoreBar value={customer.opportunity_score} color="#00d4ff" label="Opportunity Score" /></Card>
      </div>

      {/* Purchase intel */}
      <Card className="mb-4">
        <SectionLabel>Purchase Intelligence</SectionLabel>
        <InfoRow label="Total Spend" value={formatCurrency(customer.total_spend)} />
        <InfoRow label="Total Orders" value={customer.total_orders} />
        <InfoRow label="Avg Order Value" value={formatCurrency(customer.average_order_value)} />
        <InfoRow label="Last Purchase" value={daysSinceLabel(customer.last_purchase_at)} />
        {customer.last_product_name && (
          <InfoRow label="Last Product" value={customer.last_product_name} />
        )}
      </Card>

      {/* Engagement */}
      <Card className="mb-4">
        <SectionLabel>Engagement Signals</SectionLabel>
        <InfoRow
          label="Email Open Rate"
          value={customer.email_open_rate !== null
            ? `${Math.round((customer.email_open_rate ?? 0) * 100)}%`
            : 'Unknown'}
        />
        <InfoRow
          label="Email Click Rate"
          value={customer.email_click_rate !== null
            ? `${Math.round((customer.email_click_rate ?? 0) * 100)}%`
            : 'Unknown'}
        />
        <InfoRow label="SMS Engaged" value={customer.sms_engaged ? 'Yes' : 'No'} />
      </Card>

      {/* Signal */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 mb-4">
        <SectionLabel>Signal — Why This Customer Matters Now</SectionLabel>
        <p className="text-[12px] text-white/65 leading-relaxed">{customer.reason_code}</p>
      </div>

      {/* Suggested action */}
      <div className="rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] p-4 mb-5">
        <SectionLabel>
          <span style={{ color: 'rgba(0,212,255,0.7)' }}>⚡ Suggested Next Action</span>
        </SectionLabel>
        <p className="text-[12px] text-white/70 leading-relaxed">{customer.suggested_action}</p>
      </div>

      {/* Message generation */}
      <SectionLabel>Outreach</SectionLabel>

      {/* Channel toggle */}
      <div className="flex gap-2 mb-3">
        {(['email', 'sms'] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => { setChannel(ch); setDraft(null); setError(null) }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
              channel === ch
                ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
                : 'border-white/[0.08] text-white/35 hover:text-white/65'
            }`}
          >
            {ch === 'email' ? '✉ Email' : '💬 SMS'}
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        onClick={generateDraft}
        disabled={generating}
        className="w-full mb-3 py-2.5"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size={13} />
            Recovery Engine writing a personalised {channel === 'email' ? 'email' : 'SMS'}...
          </span>
        ) : (
          `Generate ${channel === 'email' ? 'Email' : 'SMS'} Draft →`
        )}
      </Button>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 mb-3">
          <div className="text-[11px] uppercase tracking-widest text-red-400 mb-1">Error</div>
          <div className="text-[13px] text-red-300">{error}</div>
          <div className="text-[11px] text-white/40 mt-2">
            Check your ANTHROPIC_API_KEY in your .env.local file and restart the app.
          </div>
        </div>
      )}

      {draft && !error && (
        <MessagePanel
          draft={draft}
          onApprove={() => updateDraftStatus('approved')}
          onSkip={() => updateDraftStatus('skipped')}
          onEscalate={() => updateDraftStatus('escalated')}
          onRegenerate={generateDraft}
          generating={generating}
        />
      )}
    </div>
  )
}
