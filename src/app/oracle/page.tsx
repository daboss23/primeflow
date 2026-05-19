'use client'

import React, { useState, useRef, useEffect } from 'react'

// ─── System State Data ────────────────────────────────────────────────────────

const SYSTEM_STATE = {
  totalCustomers:     10,
  criticalCount:      4,
  watchlistCount:     2,
  healthyCount:       4,
  liveRevenueLeak:    1570,
  recoverableWeek:    502,
  activeWorkflows:    4,
  pausedWorkflows:    1,
  draftWorkflows:     1,
  totalEnrolled:      490,
  conversionRate:     26.7,
  recoveredRevenue:   25960,
  pendingDrafts:      3,
  topLeakSource:      'Abandoned Cart',
  topLeakAmount:      370,
}

// ─── Oracle Signals ───────────────────────────────────────────────────────────

const ORACLE_SIGNALS = [
  {
    id:          's1',
    type:        'risk' as const,
    priority:    'critical' as const,
    module:      'Customers',
    accentColor: '#ff4060',
    title:       '4 customers at critical health',
    body:        'VIP tier customers are showing accelerated health decline. Combined LTV at immediate risk exceeds $12,000. Recovery probability drops 18% per week of inactivity.',
    nextPlay:    'Open Customer Intelligence and filter by Critical. Work top-to-bottom by opportunity score.',
    moduleHref:  '/customers?band=red',
  },
  {
    id:          's2',
    type:        'revenue' as const,
    priority:    'high' as const,
    module:      'Revenue Leak',
    accentColor: '#f59e0b',
    title:       '$1,570 leaking — $502 recoverable this week',
    body:        'Abandoned Cart accounts for the largest share at $370 across 2 customers. Dormant Buyers are the second-largest contributor. Both segments are in active recovery workflows.',
    nextPlay:    'Review Abandoned Cart Recovery sequence timing — current conversion rate is 8% below benchmark.',
    moduleHref:  '/workflows',
  },
  {
    id:          's3',
    type:        'workflow' as const,
    priority:    'critical' as const,
    module:      'Workflows',
    accentColor: '#f59e0b',
    title:       'VIP At-Risk Retention is paused',
    body:        '17 enrolled customers are not progressing. This workflow has the highest revenue-per-conversion of any active sequence at $993/conversion. Every day paused is compounding churn risk.',
    nextPlay:    'Resume VIP At-Risk Retention immediately — do not wait for the next review cycle.',
    moduleHref:  '/workflows',
  },
  {
    id:          's4',
    type:        'opportunity' as const,
    priority:    'high' as const,
    module:      'Workflows',
    accentColor: '#00d4ff',
    title:       '"Engaged, Not Converted" workflow is inactive',
    body:        'Zero customers enrolled in this sequence. High-intent browsers represent the most efficient conversion target available — they require no re-engagement, only a well-timed push.',
    nextPlay:    'Activate the Engaged-Not-Converted workflow. Expected conversion lift: 18–22%.',
    moduleHref:  '/workflows',
  },
  {
    id:          's5',
    type:        'trend' as const,
    priority:    'medium' as const,
    module:      'Analytics',
    accentColor: '#a78bfa',
    title:       'Abandoned Cart Recovery outperforming all other workflows',
    body:        'This campaign accounts for 41% of all recovered revenue this period. Conversion rate of 22% is below benchmark — improving sequence timing could compound the advantage significantly.',
    nextPlay:    'Audit Abandoned Cart sequence step 2 timing. A 4-hour shift in delivery is estimated to lift conversion by 6–10%.',
    moduleHref:  '/analytics',
  },
  {
    id:          's6',
    type:        'action' as const,
    priority:    'medium' as const,
    module:      'Drafts',
    accentColor: '#00e676',
    title:       '3 outreach drafts are awaiting approval',
    body:        'Pending drafts are stalling the outreach sequence. Response rates are significantly higher when messages are sent within the first 4 hours of the trigger event. Current drafts are approaching this threshold.',
    nextPlay:    'Review and approve pending drafts now to maintain outreach timing precision.',
    moduleHref:  '/workflows',
  },
]

// ─── Next Plays ───────────────────────────────────────────────────────────────

const NEXT_PLAYS = [
  { priority: 1, urgency: 'immediate',  text: 'Resume VIP At-Risk Retention workflow — 17 customers going cold.',      href: '/workflows',       accentColor: '#ff4060' },
  { priority: 2, urgency: 'today',      text: 'Contact top 2 critical customers before end of day.',                    href: '/customers?band=red', accentColor: '#f59e0b' },
  { priority: 3, urgency: 'today',      text: 'Approve 3 pending outreach drafts — timing window closing.',             href: '/workflows',       accentColor: '#f59e0b' },
  { priority: 4, urgency: 'this-week',  text: 'Activate "Engaged, Not Converted" workflow — zero cost, high ROI.',      href: '/workflows',       accentColor: '#00d4ff' },
  { priority: 5, urgency: 'this-week',  text: 'Audit Abandoned Cart sequence timing to lift 22% conversion rate.',      href: '/analytics',       accentColor: '#a78bfa' },
]

// ─── Oracle Chat ──────────────────────────────────────────────────────────────

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Sarah Chen',      state: 'VIP at Risk',            health: 25, ltv: 847,  lastPurchase: '3 months ago', opportunity: 100 },
  { id: '2', name: 'Aisha Mohammed',  state: 'VIP at Risk',            health: 30, ltv: 2840, lastPurchase: '2 months ago', opportunity: 100 },
  { id: '3', name: 'James Whitfield', state: 'Abandoned Cart',         health: 5,  ltv: 0,    lastPurchase: 'Never',        opportunity: 73  },
  { id: '4', name: 'Tobias Klein',    state: 'Engaged, Not Converted', health: 30, ltv: 0,    lastPurchase: 'Never',        opportunity: 69  },
  { id: '5', name: 'Maria Santos',    state: 'Healthy',                health: 85, ltv: 1240, lastPurchase: '2 weeks ago',  opportunity: 20  },
  { id: '6', name: 'David Park',      state: 'Replenishment Due',      health: 55, ltv: 620,  lastPurchase: '6 weeks ago',  opportunity: 60  },
  { id: '7', name: 'Emma Wilson',     state: 'Failed Payment',         health: 10, ltv: 390,  lastPurchase: '1 month ago',  opportunity: 80  },
  { id: '8', name: 'Liam Johnson',    state: 'Healthy',                health: 90, ltv: 3200, lastPurchase: '1 week ago',   opportunity: 10  },
  { id: '9', name: 'Priya Patel',     state: 'Replenishment Due',      health: 50, ltv: 780,  lastPurchase: '7 weeks ago',  opportunity: 55  },
  { id: '10', name: 'Omar Hassan',    state: 'Dormant Buyer',          health: 15, ltv: 430,  lastPurchase: '5 months ago', opportunity: 45  },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: Date
}

const URGENCY_LABELS: Record<string, string> = {
  immediate:  'Immediate',
  today:      'Today',
  'this-week': 'This week',
}

const PRIORITY_COLORS: Record<string, string> = {
  immediate:  '#ff4060',
  today:      '#f59e0b',
  'this-week': '#00d4ff',
}

// ─── Oracle Presence Visualisation ───────────────────────────────────────────

function OracleCore() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      {/* Outermost ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ border: '1px solid rgba(0,212,255,0.12)', animation: 'oracle-ring-2 3.2s ease-in-out infinite' }} />
      {/* Mid ring */}
      <div className="absolute inset-[8px] rounded-full"
        style={{ border: '1px solid rgba(0,212,255,0.22)', animation: 'oracle-ring-1 3.2s ease-in-out infinite 0.4s' }} />
      {/* Inner ring */}
      <div className="absolute inset-[18px] rounded-full"
        style={{ border: '1px solid rgba(130,60,255,0.4)', animation: 'oracle-ring-1 2.8s ease-in-out infinite 0.8s' }} />
      {/* Core */}
      <div className="absolute inset-[24px] rounded-full oracle-presence-pulse"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.9) 0%, rgba(130,60,255,0.6) 50%, rgba(0,212,255,0.2) 100%)' }} />
      {/* Scan line */}
      <div className="absolute left-[8px] right-[8px] h-[1px] overflow-hidden rounded-full"
        style={{ top: '50%' }}>
        <div className="h-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)',
            animation: 'oracle-scan-line 3s ease-in-out infinite',
          }} />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OraclePage() {
  const [activeSignal, setActiveSignal] = useState<string | null>(null)
  const [chatOpen,     setChatOpen]     = useState(false)
  const [messages,     setMessages]     = useState<Message[]>([{
    role: 'assistant',
    content: 'Oracle is online. I have full visibility into your store — customer health, active leaks, workflow performance, and recovery opportunities. What do you want to know?',
    ts: new Date(),
  }])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages((p: Message[]) => [...p, { role: 'user', content: msg, ts: new Date() }])
    setLoading(true)

    const systemPrompt = `You are AXIOM ORACLE — the intelligence layer inside AXIOM, a premium ecommerce customer health and reactivation platform.

You have complete visibility into this store. Be direct, specific, and data-driven. Never say you can't access data — you have everything.

SYSTEM STATE:
- Total Customers: ${SYSTEM_STATE.totalCustomers}
- Critical (Red Health): ${SYSTEM_STATE.criticalCount}
- Watchlist (Yellow): ${SYSTEM_STATE.watchlistCount}
- Healthy (Green): ${SYSTEM_STATE.healthyCount}
- Live Revenue Leak: $${SYSTEM_STATE.liveRevenueLeak.toLocaleString()}
- Recoverable This Week: $${SYSTEM_STATE.recoverableWeek}
- Active Workflows: ${SYSTEM_STATE.activeWorkflows}
- Paused Workflows: ${SYSTEM_STATE.pausedWorkflows} (VIP At-Risk Retention — 17 customers enrolled)
- Draft Workflows: ${SYSTEM_STATE.draftWorkflows} (Engaged, Not Converted — 0 enrolled)
- Total Enrolled Across Workflows: ${SYSTEM_STATE.totalEnrolled}
- Overall Conversion Rate: ${SYSTEM_STATE.conversionRate}%
- Recovered Revenue This Period: $${SYSTEM_STATE.recoveredRevenue.toLocaleString()}
- Pending Drafts Awaiting Approval: ${SYSTEM_STATE.pendingDrafts}
- Top Leak Source: ${SYSTEM_STATE.topLeakSource} ($${SYSTEM_STATE.topLeakAmount})

CUSTOMERS:
${DEMO_CUSTOMERS.map(c => `- ${c.name}: ${c.state}, Health ${c.health}/100, LTV $${c.ltv}, Last Purchase: ${c.lastPurchase}, Opportunity: ${c.opportunity}%`).join('\n')}

RESPONSE STYLE:
- Lead with the most important insight. Be concise — max 3 paragraphs.
- Use exact names and numbers. Bold key data points with **markdown**.
- End with one clear next action.
- Never start with "Certainly" or "Of course". Get straight to the intelligence.`

    try {
      const history = messages.slice(-6).map((m: Message) => ({ role: m.role, content: m.content }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 800,
          system:     systemPrompt,
          messages:   [...history, { role: 'user', content: msg }],
        }),
      })
      const data  = await res.json()
      const reply = data.content?.[0]?.text ?? 'Signal lost. Try again.'
      setMessages((p: Message[]) => [...p, { role: 'assistant', content: reply, ts: new Date() }])
    } catch {
      setMessages((p: Message[]) => [...p, { role: 'assistant', content: 'Connection interrupted. Check your network.', ts: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  function formatContent(text: string) {
    return text.split('\n').map((line, i) => (
      <p key={i} style={{ margin: '0 0 6px 0' }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />
    ))
  }

  return (
    <div className="flex-1 overflow-y-auto h-full" style={{ background: '#070714' }}>
      <div className="max-w-[1320px] mx-auto px-8 py-8">

        {/* ── ORACLE HEADER ── */}
        <div className="flex items-start gap-6 mb-8 pb-7"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <OracleCore />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[22px] font-bold tracking-tight text-white">Oracle</h1>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                Intelligence Layer
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-1.5 h-1.5 rounded-full pulse-dot"
                  style={{ background: '#00e676', boxShadow: '0 0 5px #00e676' }} />
                <span className="text-[10px] tracking-[0.12em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>Live · Reading system</span>
              </div>
            </div>
            <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Oracle reads the platform, identifies what matters, and surfaces the next best actions.
            </p>

            {/* System state strip */}
            <div className="flex items-center gap-0 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
              {[
                { label: 'Critical',         value: String(SYSTEM_STATE.criticalCount),                     color: '#ff4060' },
                { label: 'Watchlist',         value: String(SYSTEM_STATE.watchlistCount),                    color: '#f59e0b' },
                { label: 'Revenue Leak',      value: `$${SYSTEM_STATE.liveRevenueLeak.toLocaleString()}`,    color: '#ff8c00' },
                { label: 'Recoverable',       value: `$${SYSTEM_STATE.recoverableWeek}`,                    color: '#00e676' },
                { label: 'Active Workflows',  value: String(SYSTEM_STATE.activeWorkflows),                   color: '#00d4ff' },
                { label: 'Conversion Rate',   value: `${SYSTEM_STATE.conversionRate}%`,                     color: '#a78bfa' },
                { label: 'Pending Drafts',    value: String(SYSTEM_STATE.pendingDrafts),                     color: '#f59e0b' },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex-1 px-4 py-3"
                  style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="text-[9px] uppercase tracking-[0.14em] mb-1"
                    style={{ color: 'rgba(255,255,255,0.25)' }}>{stat.label}</div>
                  <div className="text-[16px] font-bold tabular-nums"
                    style={{ color: stat.color, fontFamily: 'var(--font-jetbrains)' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="grid grid-cols-[1fr_340px] gap-6">

          {/* LEFT: Signals + Next Plays */}
          <div className="space-y-6">

            {/* Active Signals */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>Active Signals</div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="w-1 h-1 rounded-full pulse-dot"
                    style={{ background: '#00d4ff', boxShadow: '0 0 4px #00d4ff' }} />
                  <span className="text-[9px] uppercase tracking-[0.12em]"
                    style={{ color: 'rgba(255,255,255,0.2)' }}>{ORACLE_SIGNALS.length} detected</span>
                </div>
              </div>

              <div className="space-y-2">
                {ORACLE_SIGNALS.map((sig) => {
                  const isActive = activeSignal === sig.id
                  return (
                    <div
                      key={sig.id}
                      className={`rounded-xl transition-all duration-500 cursor-pointer oracle-signal-in ${isActive ? 'oracle-card-glow' : ''}`}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${sig.accentColor}0c 0%, rgba(255,255,255,0.01) 70%)`
                          : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? sig.accentColor + '25' : 'rgba(255,255,255,0.05)'}`,
                      }}
                      onClick={() => setActiveSignal(isActive ? null : sig.id)}
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Left accent */}
                        <div className="w-[2px] self-stretch rounded-full flex-shrink-0 transition-all duration-500"
                          style={{
                            background:  isActive ? sig.accentColor : 'rgba(255,255,255,0.1)',
                            boxShadow:   isActive ? `0 0 8px ${sig.accentColor}66` : 'none',
                            minHeight:   20,
                          }} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-bold tracking-[0.18em] uppercase"
                              style={{ color: sig.accentColor + 'cc' }}>{sig.module}</span>
                            <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 9 }}>·</span>
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full"
                                style={{ background: sig.priority === 'critical' ? '#ff4060' : sig.priority === 'high' ? '#f59e0b' : sig.priority === 'medium' ? '#00d4ff' : '#a78bfa' }} />
                              <span className="text-[9px] uppercase tracking-[0.1em]"
                                style={{ color: 'rgba(255,255,255,0.2)' }}>{sig.priority}</span>
                            </div>
                          </div>

                          <div className="text-[13px] font-semibold leading-snug mb-1"
                            style={{ color: isActive ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.65)' }}>
                            {sig.title}
                          </div>

                          {isActive && (
                            <div className="oracle-type-in space-y-3">
                              <div className="text-[12px] leading-relaxed"
                                style={{ color: 'rgba(255,255,255,0.42)' }}>{sig.body}</div>
                              <div className="flex items-start gap-2 pt-2.5"
                                style={{ borderTop: `1px solid ${sig.accentColor}18` }}>
                                <div className="w-4 h-4 rounded flex items-center justify-center mt-0.5 flex-shrink-0"
                                  style={{ background: sig.accentColor + '1c' }}>
                                  <svg width="8" height="8" fill="none" viewBox="0 0 8 8">
                                    <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke={sig.accentColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-[9px] uppercase tracking-[0.14em] mb-0.5"
                                    style={{ color: 'rgba(255,255,255,0.18)' }}>Next play</div>
                                  <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    {sig.nextPlay}
                                  </div>
                                </div>
                              </div>
                              <a href={sig.moduleHref}
                                className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.05em] hover:opacity-80 transition-opacity"
                                style={{ color: sig.accentColor }}>
                                Go to {sig.module}
                                <svg width="8" height="8" fill="none" viewBox="0 0 8 8">
                                  <path d="M1 4h6M4.5 1.5L7 4l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Expand chevron */}
                        <svg width="12" height="12" fill="none" viewBox="0 0 16 16"
                          className="flex-shrink-0 mt-0.5 transition-transform duration-300"
                          style={{ color: 'rgba(255,255,255,0.2)', transform: isActive ? 'rotate(180deg)' : 'none' }}>
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Next Plays */}
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.3)' }}>Next Plays</div>

              <div className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                {NEXT_PLAYS.map((play, i) => (
                  <a
                    key={play.priority}
                    href={play.href}
                    className="flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-white/[0.02] group"
                    style={{ borderBottom: i < NEXT_PLAYS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    {/* Priority number */}
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                      style={{ background: PRIORITY_COLORS[play.urgency] + '18', color: PRIORITY_COLORS[play.urgency] }}>
                      {play.priority}
                    </div>

                    {/* Text */}
                    <div className="flex-1 text-[12px] font-medium"
                      style={{ color: 'rgba(255,255,255,0.72)' }}>{play.text}</div>

                    {/* Urgency badge */}
                    <span className="text-[9px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: PRIORITY_COLORS[play.urgency] + '14', color: PRIORITY_COLORS[play.urgency] }}>
                      {URGENCY_LABELS[play.urgency]}
                    </span>

                    {/* Arrow */}
                    <svg width="10" height="10" fill="none" viewBox="0 0 16 16"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: PRIORITY_COLORS[play.urgency] }}>
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Ask Oracle */}
          <div className="flex flex-col rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)', height: 'fit-content', minHeight: 400 }}>

            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              <div className="relative w-3 h-3 flex-shrink-0">
                <div className="absolute inset-0 rounded-full oracle-ring-1"
                  style={{ border: '1px solid rgba(0,212,255,0.4)' }} />
                <div className="absolute inset-[2px] rounded-full"
                  style={{ background: 'radial-gradient(circle, #00d4ff 0%, #8b5cf6 100%)' }} />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Ask Oracle
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ background: '#00e676', boxShadow: '0 0 3px #00e676' }} />
                <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.2)' }}>Live</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 280, maxHeight: 400 }}>
              {messages.map((msg: Message, i: number) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
                    style={{
                      background: msg.role === 'assistant'
                        ? 'radial-gradient(circle, rgba(0,212,255,0.35) 0%, rgba(130,60,255,0.18) 100%)'
                        : 'rgba(255,255,255,0.07)',
                      border: msg.role === 'assistant' ? '1px solid rgba(0,212,255,0.25)' : '1px solid rgba(255,255,255,0.1)',
                      color: msg.role === 'assistant' ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    }}>
                    {msg.role === 'assistant' ? 'AX' : 'YOU'}
                  </div>
                  <div className="max-w-[85%] rounded-xl px-3 py-2.5 text-[12px] leading-relaxed"
                    style={{
                      background: msg.role === 'assistant' ? 'rgba(255,255,255,0.04)' : 'rgba(0,212,255,0.07)',
                      border:     msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,212,255,0.18)',
                      color:      msg.role === 'assistant' ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.72)',
                      borderRadius: msg.role === 'assistant' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                    }}>
                    {formatContent(msg.content)}
                    <div className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
                      {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
                    style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.35) 0%, rgba(130,60,255,0.18) 100%)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}>
                    AX
                  </div>
                  <div className="rounded-xl px-3 py-2.5 flex gap-1.5 items-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {[0, 0.2, 0.4].map((d, j) => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full pulse-dot"
                        style={{ background: 'rgba(0,212,255,0.5)', animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested questions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {[
                  'Who needs action today?',
                  'What\'s my biggest leak?',
                  'Which workflow is underperforming?',
                  'Who are my top save opportunities?',
                ].map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="px-2.5 py-1 rounded-full text-[10px] transition-all hover:text-[#00d4ff] hover:border-[rgba(0,212,255,0.3)] hover:bg-[rgba(0,212,255,0.06)]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex gap-2 items-end rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <textarea
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Ask Oracle anything about your store…"
                  rows={1}
                  className="flex-1 bg-transparent outline-none resize-none text-[12px] leading-relaxed"
                  style={{ color: '#fff', fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #00d4ff, #8b5cf6)' : 'rgba(255,255,255,0.06)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
