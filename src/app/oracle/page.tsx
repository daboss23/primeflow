'use client'

import { useState, useRef, useEffect } from 'react'

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Sarah Chen', state: 'VIP at Risk', health: 25, ltv: 847, lastPurchase: '3 months ago', opportunity: 100, email: 'sarah@example.com' },
  { id: '2', name: 'Aisha Mohammed', state: 'VIP at Risk', health: 30, ltv: 2840, lastPurchase: '2 months ago', opportunity: 100, email: 'aisha@example.com' },
  { id: '3', name: 'James Whitfield', state: 'Abandoned Cart', health: 5, ltv: 0, lastPurchase: 'Never', opportunity: 73, email: 'james@example.com' },
  { id: '4', name: 'Tobias Klein', state: 'Engaged, Not Converted', health: 30, ltv: 0, lastPurchase: 'Never', opportunity: 69, email: 'tobias@example.com' },
  { id: '5', name: 'Maria Santos', state: 'Healthy', health: 85, ltv: 1240, lastPurchase: '2 weeks ago', opportunity: 20, email: 'maria@example.com' },
  { id: '6', name: 'David Park', state: 'Replenishment Due', health: 55, ltv: 620, lastPurchase: '6 weeks ago', opportunity: 60, email: 'david@example.com' },
  { id: '7', name: 'Emma Wilson', state: 'Failed Payment', health: 10, ltv: 390, lastPurchase: '1 month ago', opportunity: 80, email: 'emma@example.com' },
  { id: '8', name: 'Liam Johnson', state: 'Healthy', health: 90, ltv: 3200, lastPurchase: '1 week ago', opportunity: 10, email: 'liam@example.com' },
  { id: '9', name: 'Priya Patel', state: 'Replenishment Due', health: 50, ltv: 780, lastPurchase: '7 weeks ago', opportunity: 55, email: 'priya@example.com' },
  { id: '10', name: 'Omar Hassan', state: 'Dormant Buyer', health: 15, ltv: 430, lastPurchase: '5 months ago', opportunity: 45, email: 'omar@example.com' },
]

const STORE_METRICS = {
  totalRevenue: 9347,
  totalCustomers: 10,
  criticalAtRisk: 4,
  recoveredRevenue: 0,
  liveRevenueLeak: 1570,
  recoverableThisWeek: 502,
  abandonedCarts: 2,
  abandonedValue: 370,
  failedPayments: 1,
  failedValue: 210,
  vipsAtRisk: 2,
  vipValue: 680,
  avgLTV: 634,
  topCustomerLTV: 3200,
}

const SUGGESTED_QUESTIONS = [
  'Who are my top customers at risk right now?',
  'How much revenue am I leaking this week?',
  'Which customers should I contact first?',
  'What is my biggest recovery opportunity?',
  'Show me all abandoned carts',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function OraclePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "AXIOM ORACLE online. I have full visibility into your store's customer health, revenue leakage, and recovery opportunities. Ask me anything.",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const userText = text || input.trim()
    if (!userText || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: userText, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const systemPrompt = `You are AXIOM ORACLE — the AI intelligence engine inside the AXIOM platform, a premium ecommerce customer health and reactivation system.

You have complete access to this store's customer data and metrics. Respond like a world-class analyst who knows every detail about this store. Be direct, confident, and specific. Use exact numbers. Never say you "don't have access" — you have everything.

STORE DATA:
- Total Revenue: $${STORE_METRICS.totalRevenue.toLocaleString()}
- Total Customers: ${STORE_METRICS.totalCustomers}
- Critical & At-Risk: ${STORE_METRICS.criticalAtRisk}
- Live Revenue Leak: $${STORE_METRICS.liveRevenueLeak}
- Recoverable This Week: $${STORE_METRICS.recoverableThisWeek}
- Abandoned Carts: ${STORE_METRICS.abandonedCarts} worth $${STORE_METRICS.abandonedValue}
- Failed Payments: ${STORE_METRICS.failedPayments} worth $${STORE_METRICS.failedValue}
- VIPs At Risk: ${STORE_METRICS.vipsAtRisk} worth $${STORE_METRICS.vipValue}
- Average LTV: $${STORE_METRICS.avgLTV}
- Top Customer LTV: $${STORE_METRICS.topCustomerLTV}

CUSTOMERS:
${DEMO_CUSTOMERS.map(c => `- ${c.name}: ${c.state}, Health Score ${c.health}/100, LTV $${c.ltv}, Last Purchase: ${c.lastPurchase}, Recovery Opportunity: ${c.opportunity}%`).join('\n')}

RESPONSE STYLE:
- Be concise but insightful. Lead with the most important insight.
- Use specific names, numbers, and dollar amounts from the data.
- When recommending actions, be precise about WHO to contact and WHY.
- Format lists cleanly. Bold key names or numbers using markdown **like this**.
- Max 3-4 paragraphs unless the question demands more detail.
- Never start with "Certainly" or "Of course" — get straight to the intelligence.
- Sign off with a short follow-up question or action suggestion when relevant.`

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
      const reply = data.content?.[0]?.text || 'Signal lost. Please try again.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection interrupted. Check your network and try again.', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function formatContent(text: string) {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} style={{ margin: '0 0 6px 0' }} dangerouslySetInnerHTML={{ __html: boldFormatted }} />
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#070714', color: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 36, height: 36 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(130,60,255,0.15) 50%, transparent 70%)',
              animation: 'oraclePulse 2.5s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute', inset: '6px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.6) 0%, rgba(130,60,255,0.3) 100%)',
            }} />
            <style>{`
              @keyframes oraclePulse {
                0%,100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.8); opacity: 0; }
              }
              @keyframes blink {
                0%,100% { opacity: 1; }
                50% { opacity: 0; }
              }
            `}</style>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.08em', color: '#fff' }}>AXIOM ORACLE</div>
            <div style={{ fontSize: 11, color: 'rgba(0,212,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Store Intelligence Engine</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676aa' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
        </div>

        {/* Metrics strip */}
        <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {[
            { label: 'Revenue Leak', value: `$${STORE_METRICS.liveRevenueLeak.toLocaleString()}`, color: '#ff4d6d' },
            { label: 'Recoverable', value: `$${STORE_METRICS.recoverableThisWeek}`, color: '#00e676' },
            { label: 'At Risk', value: `${STORE_METRICS.criticalAtRisk} customers`, color: '#ffab00' },
            { label: 'Total LTV', value: `$${STORE_METRICS.totalRevenue.toLocaleString()}`, color: '#00d4ff' },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'assistant'
                ? 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, rgba(130,60,255,0.2) 100%)'
                : 'rgba(255,255,255,0.08)',
              border: msg.role === 'assistant' ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: msg.role === 'assistant' ? '#00d4ff' : 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em'
            }}>
              {msg.role === 'assistant' ? 'AX' : 'YOU'}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '75%',
              background: msg.role === 'assistant' ? 'rgba(255,255,255,0.04)' : 'rgba(0,212,255,0.08)',
              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,212,255,0.2)',
              borderRadius: msg.role === 'assistant' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
              padding: '12px 16px',
              fontSize: 14,
              lineHeight: 1.65,
              color: msg.role === 'assistant' ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.75)',
            }}>
              {formatContent(msg.content)}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, rgba(130,60,255,0.2) 100%)',
              border: '1px solid rgba(0,212,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: '#00d4ff'
            }}>AX</div>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '4px 12px 12px 12px', padding: '14px 18px',
              display: 'flex', gap: 6, alignItems: 'center'
            }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'rgba(0,212,255,0.6)',
                  animation: `blink 1.2s ease-in-out ${delay}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 28px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.08)'; (e.target as HTMLElement).style.color = '#00d4ff'; (e.target as HTMLElement).style.borderColor = 'rgba(0,212,255,0.3)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 28px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Oracle anything about your store..."
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14, lineHeight: 1.5, resize: 'none',
              fontFamily: 'inherit', placeholder: 'rgba(255,255,255,0.2)'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: input.trim() && !loading ? 'linear-gradient(135deg, #00d4ff, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 2L8 14L7 9L2 8Z" stroke={input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 8, textAlign: 'center', letterSpacing: '0.05em' }}>
          ORACLE has access to all customer health scores, revenue data, and store metrics
        </div>
      </div>
    </div>
  )
}
