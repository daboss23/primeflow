'use client'

import { useState, useRef, useEffect } from 'react'
import {
  getOracleBrief, sortedSignals,
  SIGNAL_STYLE, SYSTEM_STATE_STYLE,
  type OracleSignal, type SystemState,
} from '@/lib/oracle'
import { OracleIcon } from '@/components/oracle/OracleBrief'

// ─── Demo data for chat mode ──────────────────────────────────────────────────

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Sarah Chen',      state: 'VIP at Risk',            health: 25,  ltv: 847,  lastPurchase: '3 months ago',  opportunity: 100 },
  { id: '2', name: 'Aisha Mohammed',  state: 'VIP at Risk',            health: 30,  ltv: 2840, lastPurchase: '2 months ago',  opportunity: 100 },
  { id: '3', name: 'James Whitfield', state: 'Abandoned Cart',         health: 5,   ltv: 0,    lastPurchase: 'Never',         opportunity: 73  },
  { id: '4', name: 'Tobias Klein',    state: 'Engaged, Not Converted', health: 30,  ltv: 0,    lastPurchase: 'Never',         opportunity: 69  },
  { id: '5', name: 'Maria Santos',    state: 'Healthy',                health: 85,  ltv: 1240, lastPurchase: '2 weeks ago',   opportunity: 20  },
  { id: '6', name: 'David Park',      state: 'Replenishment Due',      health: 55,  ltv: 620,  lastPurchase: '6 weeks ago',   opportunity: 60  },
  { id: '7', name: 'Emma Wilson',     state: 'Failed Payment',         health: 10,  ltv: 390,  lastPurchase: '1 month ago',   opportunity: 80  },
  { id: '8', name: 'Liam Johnson',    state: 'Healthy',                health: 90,  ltv: 3200, lastPurchase: '1 week ago',    opportunity: 10  },
  { id: '9', name: 'Priya Patel',     state: 'Replenishment Due',      health: 50,  ltv: 780,  lastPurchase: '7 weeks ago',   opportunity: 55  },
  { id: '10', name: 'Omar Hassan',    state: 'Dormant Buyer',          health: 15,  ltv: 430,  lastPurchase: '5 months ago',  opportunity: 45  },
]

const STORE_METRICS = {
  totalRevenue: 9347, totalCustomers: 10, criticalAtRisk: 4,
  liveRevenueLeak: 1570, recoverableThisWeek: 502,
  abandonedCarts: 2, failedPayments: 1, vipsAtRisk: 2,
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Signal detail card ───────────────────────────────────────────────────────

function SignalDetailCard({ signal }: { signal: OracleSignal }) {
  const s = SIGNAL_STYLE[signal.type]
  const isCritical = signal.priority === 'critical'

  return (
    <div className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 rounded"
            style={{ color: s.color, background: `${s.color}15` }}>
            {s.label}
          </span>
          <span className="text-[9px] font-medium tracking-[0.1em] uppercase"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            {signal.priority}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCritical && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: s.color }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: s.color }} />
            </span>
          )}
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}>
            {signal.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-[13px] font-semibold leading-snug mb-2"
        style={{ color: 'rgba(255,255,255,0.9)' }}>
        {signal.title}
      </div>

      {/* Body */}
      <div className="text-[12px] leading-relaxed mb-4"
        style={{ color: 'rgba(255,255,255,0.5)' }}>
        {signal.body}
      </div>

      {/* Target */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: 'rgba(255,255,255,0.2)' }}>Target</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded"
          style={{ color: s.color, background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
          {signal.targetLabel}
        </span>
        {signal.impactValue && (
          <span className="text-[10px] font-semibold ml-auto"
            style={{ color: '#00e676', fontFamily: 'var(--font-jetbrains)' }}>
            ${signal.impactValue.toLocaleString()} impact
          </span>
        )}
      </div>

      {/* Next play */}
      <div className="flex items-start gap-2 pt-3"
        style={{ borderTop: `1px solid ${s.border}` }}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
          className="mt-0.5 flex-shrink-0" style={{ color: s.color }}>
          <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] font-semibold leading-snug" style={{ color: s.color }}>
          {signal.nextPlay}
        </span>
      </div>
    </div>
  )
}

// ─── System state header ──────────────────────────────────────────────────────

function SystemStateBar({ state }: { state: SystemState }) {
  const cfg = SYSTEM_STATE_STYLE[state]
  const signals = sortedSignals()
  const criticalCount = signals.filter(s => s.priority === 'critical').length
  const totalImpact = signals.reduce((sum, s) => sum + (s.impactValue ?? 0), 0)

  return (
    <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>

      <div className="oracle-scan-line"
        style={{ '--scan-color': cfg.color } as React.CSSProperties} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.border}` }}>
            <OracleIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase oracle-gradient-text">
                Oracle
              </span>
              <div className="w-px h-3 bg-white/[0.08]" />
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: cfg.color }}>
                System {cfg.label}
              </span>
              {(state === 'critical' || state === 'watch') && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ background: cfg.color }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: cfg.color }} />
                </span>
              )}
            </div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Intelligence layer active · {signals.length} signals detected · {criticalCount} critical
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {[
            { label: 'Active Signals', value: String(signals.length), color: cfg.color },
            { label: 'Critical', value: String(criticalCount), color: '#ff4060' },
            { label: 'Total Impact', value: `$${totalImpact.toLocaleString()}`, color: '#00e676' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-right">
              <div className="text-[9px] font-semibold tracking-[0.12em] uppercase mb-0.5"
                style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
              <div className="text-[18px] font-bold"
                style={{ color, fontFamily: 'var(--font-jetbrains)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Chat mode ────────────────────────────────────────────────────────────────

function ChatMode() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Oracle online. I have full visibility into your store's customer health, revenue leakage, and recovery opportunities. What do you need to know?",
    timestamp: new Date(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const systemPrompt = `You are AXIOM ORACLE — the AI intelligence engine inside AXIOM, a premium ecommerce customer health and revenue recovery system.

You have complete access to this store's data. Respond like a world-class analyst — direct, specific, commercially useful. Use exact numbers. Never hedge unnecessarily.

STORE DATA:
- Total Revenue: $${STORE_METRICS.totalRevenue.toLocaleString()}
- Total Customers: ${STORE_METRICS.totalCustomers}
- Critical & At-Risk: ${STORE_METRICS.criticalAtRisk}
- Live Revenue Leak: $${STORE_METRICS.liveRevenueLeak}
- Recoverable This Week: $${STORE_METRICS.recoverableThisWeek}
- Abandoned Carts: ${STORE_METRICS.abandonedCarts}
- Failed Payments: ${STORE_METRICS.failedPayments}
- VIPs At Risk: ${STORE_METRICS.vipsAtRisk}

CUSTOMERS:
${DEMO_CUSTOMERS.map(c => `- ${c.name}: ${c.state}, Health ${c.health}/100, LTV $${c.ltv}, Last Purchase: ${c.lastPurchase}, Recovery Opportunity: ${c.opportunity}%`).join('\n')}

ACTIVE ORACLE SIGNALS:
- CRITICAL: VIP Retention workflow paused — 17 customers, $8,940 stalled
- CRITICAL: Top VIP (Aisha Mohammed, $2,840 LTV) approaching churn threshold
- HIGH: Dormant Win-Back converting at only 13.2% — sequence underperforming
- HIGH: Failed Payment Recovery at 50% conversion — expand enrollment
- HIGH: Cart recovery stalling at step 2 — $370 in active cart value
- MEDIUM: Engaged-Unconverted workflow never activated — 69+ customers qualifying

RESPONSE STYLE:
- Lead with the most important insight
- Use specific names and dollar amounts
- Give concrete next actions, not vague suggestions
- Max 3-4 paragraphs unless more detail is needed
- Never start with "Certainly" or "Of course"
- Bold key names and numbers using **markdown**`

  async function sendMessage(text?: string) {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userText, timestamp: new Date() }])
    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...history, { role: 'user', content: userText }],
        }),
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Signal lost. Try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection interrupted.', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  function formatContent(text: string) {
    return text.split('\n').map((line, i) => (
      <p key={i} style={{ margin: '0 0 5px 0' }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    ))
  }

  const SUGGESTED = [
    'Which workflow should I focus on first?',
    'Who are my highest-value customers at risk?',
    'Where is revenue leaking most?',
    'What should I do in the next 24 hours?',
  ]

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
              style={{
                background: msg.role === 'assistant'
                  ? 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, rgba(0,212,255,0.2) 100%)'
                  : 'rgba(255,255,255,0.06)',
                border: msg.role === 'assistant' ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.1)',
                color: msg.role === 'assistant' ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              }}>
              {msg.role === 'assistant' ? <OracleIcon size={12} /> : 'YOU'}
            </div>
            <div className="max-w-[78%] px-4 py-3 rounded-xl text-[13px] leading-relaxed"
              style={{
                background: msg.role === 'assistant' ? 'rgba(255,255,255,0.04)' : 'rgba(167,139,250,0.08)',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(167,139,250,0.2)',
                borderRadius: msg.role === 'assistant' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                color: msg.role === 'assistant' ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.7)',
              }}>
              {formatContent(msg.content)}
              <div className="text-[9px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, rgba(0,212,255,0.2) 100%)', border: '1px solid rgba(167,139,250,0.3)' }}>
              <OracleIcon size={12} />
            </div>
            <div className="px-4 py-3 rounded-xl flex gap-1.5 items-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 14px 14px 14px' }}>
              {[0, 0.18, 0.36].map((delay, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'rgba(167,139,250,0.6)', animation: `pulse-dot 1.2s ease-in-out ${delay}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 py-3">
          {SUGGESTED.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', color: 'rgba(255,255,255,0.45)' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-3 items-end rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask Oracle anything about your store…"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-[13px]"
            style={{ color: '#fff', fontFamily: 'inherit' }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: input.trim() && !loading ? 'linear-gradient(135deg,#a78bfa,#00d4ff)' : 'rgba(255,255,255,0.06)' }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Oracle Page ──────────────────────────────────────────────────────────────

export default function OraclePage() {
  const [tab, setTab] = useState<'intelligence' | 'ask'>('intelligence')
  const brief = getOracleBrief()
  const signals = sortedSignals()

  return (
    <div className="flex-1 overflow-y-auto h-full" style={{ background: '#070714' }}>
      <div className="max-w-[1200px] mx-auto px-8 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <OracleIcon size={20} />
              <h1 className="text-[24px] font-bold tracking-tight text-white oracle-gradient-text">
                Oracle
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: SYSTEM_STATE_STYLE[brief.systemState].bg, border: `1px solid ${SYSTEM_STATE_STYLE[brief.systemState].border}` }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ background: SYSTEM_STATE_STYLE[brief.systemState].color }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: SYSTEM_STATE_STYLE[brief.systemState].color }} />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: SYSTEM_STATE_STYLE[brief.systemState].color }}>
                  {brief.systemState}
                </span>
              </div>
            </div>
            <p className="text-[12px] ml-[36px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Embedded intelligence layer · Reads the platform · Guides the next play
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {([
              { id: 'intelligence', label: 'Intelligence' },
              { id: 'ask', label: 'Ask Oracle' },
            ] as const).map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
                style={tab === id
                  ? { background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }
                  : { color: 'rgba(255,255,255,0.32)', border: '1px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Intelligence tab */}
        {tab === 'intelligence' && (
          <>
            <SystemStateBar state={brief.systemState} />

            {/* Signal grid */}
            <div className="grid grid-cols-2 gap-4">
              {signals.map(signal => (
                <SignalDetailCard key={signal.id} signal={signal} />
              ))}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Intelligence computed from workflow performance, customer health scores, and revenue signals · Updates every 6 hours
              </span>
            </div>
          </>
        )}

        {/* Ask Oracle tab */}
        {tab === 'ask' && <ChatMode />}

      </div>
    </div>
  )
}
