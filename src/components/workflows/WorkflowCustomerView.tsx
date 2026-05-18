'use client'

// FILE: src/components/workflows/WorkflowCustomerView.tsx

import React, { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole    = 'ai' | 'customer' | 'operator'
type MessageChannel = 'Email' | 'SMS'
type MessageStatus  = 'sent' | 'delivered' | 'opened' | 'replied' | 'received'

interface ConversationMessage {
  id: string
  role: MessageRole
  channel: MessageChannel
  content: string
  subject?: string
  timestamp: string
  status?: MessageStatus
}

export interface WorkflowCustomer {
  id: string
  name: string
  email: string
  state: string
  healthScore: number
  totalSpend: number
  lastPurchase: string
  entryReason: string
  currentStep: string
  workflowStatus: 'active' | 'converted' | 'exited'
}

type WorkflowTrigger =
  | 'abandoned_cart'
  | 'failed_payment'
  | 'dormant_buyer'
  | 'repeat_at_risk'
  | 'replenishment'
  | 'engaged_unconverted'

// ─── Workflow-Specific Thread Data ────────────────────────────────────────────

const WORKFLOW_THREADS: Record<WorkflowTrigger, ConversationMessage[]> = {
  abandoned_cart: [
    {
      id: 'm1', role: 'ai', channel: 'Email',
      subject: "{{first_name}}, your cart is waiting 🛒",
      content: `Hi {{first_name}},\n\nYou left something behind — and we wanted to make sure you didn't miss out.\n\nYour cart is still saved with the items you loved. We're holding them for you, but they won't last long.\n\nAs a little nudge, we're offering free shipping if you complete your order in the next 2 hours.\n\n→ Complete my order\n\nTalk soon,\nThe Team`,
      timestamp: '2 days ago · 10:14 AM', status: 'opened',
    },
    {
      id: 'm2', role: 'ai', channel: 'SMS',
      content: `Hey {{first_name}}! Your cart is still saved + free shipping for the next 2hrs 🛒 → [link]`,
      timestamp: '2 days ago · 2:30 PM', status: 'delivered',
    },
    {
      id: 'm3', role: 'customer', channel: 'SMS',
      content: `Is the free shipping offer still valid if I order tomorrow? I just need to check my size first`,
      timestamp: '1 day ago · 9:17 AM', status: 'received',
    },
  ],
  failed_payment: [
    {
      id: 'm1', role: 'ai', channel: 'Email',
      subject: "Action needed: Complete your recent order",
      content: `Hi {{first_name}},\n\nIt looks like there was a small issue processing your recent payment — don't worry, these things happen.\n\nYour order is still reserved. Just click below to update your payment details and we'll get it sorted straight away.\n\n→ Update payment & complete order\n\nIf you need any help, just reply to this email.\n\nBest,\nThe Team`,
      timestamp: '3 hours ago · 9:02 AM', status: 'opened',
    },
    {
      id: 'm2', role: 'customer', channel: 'Email',
      content: `Hi, I tried updating my card but the page keeps showing an error. Can you help?`,
      timestamp: '2 hours ago · 10:45 AM', status: 'received',
    },
  ],
  dormant_buyer: [
    {
      id: 'm1', role: 'ai', channel: 'Email',
      subject: "We miss you, {{first_name}} — here's something special",
      content: `Hi {{first_name}},\n\nIt's been a while since we've seen you, and we wanted to reach out.\n\nA lot has changed since your last visit — new arrivals, new collections, and a special offer we've put together just for customers like you.\n\nWe'd love to have you back.\n\n→ See what's new + claim your offer\n\nHope to see you soon,\nThe Team`,
      timestamp: '5 days ago · 11:00 AM', status: 'opened',
    },
    {
      id: 'm2', role: 'ai', channel: 'Email',
      subject: "{{first_name}}, your welcome-back offer expires soon",
      content: `Hi {{first_name}},\n\nWe noticed you opened our last email but didn't get a chance to come back — so we wanted to give you a little more time.\n\nYour exclusive welcome-back offer is still waiting, but it expires in 48 hours.\n\n→ Claim my welcome-back offer\n\nWe hope to see you soon,\nThe Team`,
      timestamp: '3 days ago · 10:00 AM', status: 'delivered',
    },
  ],
  repeat_at_risk: [
    {
      id: 'm1', role: 'ai', channel: 'Email',
      subject: "A personal note for you, {{first_name}}",
      content: `Hi {{first_name}},\n\nAs one of our most valued customers, we wanted to reach out personally.\n\nWe noticed you haven't visited recently — and we want to make sure you're getting the full experience you deserve as a VIP.\n\nWe've unlocked early access to our new collection and a private offer just for you.\n\n→ Access your VIP offer\n\nWith gratitude,\nThe Team`,
      timestamp: '4 days ago · 9:00 AM', status: 'opened',
    },
    {
      id: 'm2', role: 'customer', channel: 'Email',
      content: `Thank you for reaching out. I've been busy lately but I appreciate the personal note. I'll take a look this weekend.`,
      timestamp: '3 days ago · 7:42 PM', status: 'received',
    },
  ],
  replenishment: [
    {
      id: 'm1', role: 'ai', channel: 'SMS',
      content: `Hey {{first_name}}! Time to restock? Your last order is saved and ready to reorder in one tap 👇 [link]`,
      timestamp: '1 day ago · 8:30 AM', status: 'delivered',
    },
    {
      id: 'm2', role: 'ai', channel: 'Email',
      subject: "Time to restock, {{first_name}}?",
      content: `Hi {{first_name}},\n\nBased on your last order, you're likely running low on your favourites.\n\nWe've made it easy — your previous order is saved and ready to go. One click to reorder.\n\n→ Reorder in one click\n\nAs always, free shipping on repeat orders over $50.\n\nTake care,\nThe Team`,
      timestamp: '1 day ago · 9:00 AM', status: 'opened',
    },
  ],
  engaged_unconverted: [
    {
      id: 'm1', role: 'ai', channel: 'Email',
      subject: "Still thinking it over, {{first_name}}?",
      content: `Hi {{first_name}},\n\nWe noticed you've been browsing and wanted to reach out — sometimes a little more information is all it takes.\n\nThousands of customers love what you've been looking at, and we'd love to share why.\n\n→ See why customers love it\n\nIf you have any questions at all, just hit reply — we're here.\n\nWarmly,\nThe Team`,
      timestamp: '6 hours ago · 11:00 AM', status: 'opened',
    },
    {
      id: 'm2', role: 'customer', channel: 'Email',
      content: `I've been looking at a few different options. What makes yours better than the competitors?`,
      timestamp: '4 hours ago · 1:15 PM', status: 'received',
    },
  ],
}

const WORKFLOW_DRAFTS: Record<WorkflowTrigger, string> = {
  abandoned_cart:
    `Hi {{first_name}},\n\nAbsolutely — we can hold the free shipping offer for you until tomorrow evening. Just use the same checkout link whenever you're ready.\n\nIf you'd like help confirming sizing before you commit, our team is happy to help — just reply here and we'll get back to you right away.\n\n→ Complete my order\n\nTalk soon,\nThe Team`,
  failed_payment:
    `Hi {{first_name}},\n\nSorry to hear you're having trouble with the page — our tech team is aware of an intermittent issue and it should be resolved shortly.\n\nIn the meantime, here's a direct link that should work for you:\n\n→ Update payment details (direct link)\n\nIf you're still having trouble, just reply here and we'll process the update manually for you.\n\nBest,\nThe Team`,
  dormant_buyer:
    `Hi {{first_name}},\n\nWe're really glad you opened our last email — it means a lot that you're still thinking of us.\n\nYour welcome-back offer has been extended by an extra 48 hours, just for you. No rush — we just wanted to make sure you had enough time to explore what's new.\n\n→ Claim your extended offer\n\nLooking forward to welcoming you back,\nThe Team`,
  repeat_at_risk:
    `Hi {{first_name}},\n\nThat means a lot to us — thank you for taking the time to reply.\n\nWhenever the weekend comes around, your VIP offer will be ready and waiting. We've also saved your access link so it won't expire before you get there.\n\n→ View your VIP offer (saved link)\n\nNo pressure at all — just here whenever you need us.\n\nWith warmth,\nThe Team`,
  replenishment:
    `Hi {{first_name}},\n\nJust a quick follow-up to make sure you saw our restock reminder — your previous order is saved and ready whenever you are.\n\nIf you need to make any changes to your order (quantity, variant, address), just reply here and we'll sort it before we send it through.\n\n→ Reorder with one click\n\nTake care,\nThe Team`,
  engaged_unconverted:
    `Hi {{first_name}},\n\nGreat question — happy to explain what sets us apart.\n\nThe three things our customers mention most are: [Key differentiator 1], [Key differentiator 2], and [Key differentiator 3]. We'd love to help you find the right fit.\n\nIf it's easier, I can also put together a personalised recommendation based on exactly what you've been looking at. Just let me know.\n\n→ See why customers choose us\n\nWarmly,\nThe Team`,
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold tracking-[0.13em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
      {children}
    </div>
  )
}

function HealthRing({ score }: { score: number }) {
  const color = score >= 70 ? '#00e676' : score >= 45 ? '#f59e0b' : '#ff4d4d'
  const r = 14, c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }} />
      </svg>
      <span className="text-[18px] font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

function StatusDot({ status }: { status?: MessageStatus }) {
  if (!status) return null
  const cfg: Record<MessageStatus, { label: string; color: string }> = {
    sent:      { label: 'Sent',      color: 'rgba(255,255,255,0.28)' },
    delivered: { label: 'Delivered', color: 'rgba(255,255,255,0.4)'  },
    opened:    { label: 'Opened',    color: '#f59e0b' },
    replied:   { label: 'Replied',   color: '#00e676' },
    received:  { label: 'Received',  color: '#00d4ff' },
  }
  const c = cfg[status]
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: c.color }}>
      <span className="w-1 h-1 rounded-full inline-block" style={{ background: c.color }} />
      {c.label}
    </span>
  )
}

function ChannelPill({ channel }: { channel: MessageChannel }) {
  const isEmail = channel === 'Email'
  return (
    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{
      background: isEmail ? 'rgba(0,212,255,0.08)' : 'rgba(139,92,246,0.08)',
      color:      isEmail ? '#00d4ff'               : '#a78bfa',
      border:     `1px solid ${isEmail ? 'rgba(0,212,255,0.15)' : 'rgba(139,92,246,0.15)'}`,
    }}>
      {channel}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WorkflowCustomerView({
  customer,
  workflowName,
  workflowTrigger = 'abandoned_cart',
  onBack,
}: {
  customer: WorkflowCustomer
  workflowName: string
  workflowTrigger?: WorkflowTrigger
  onBack: () => void
}) {
  const initialThread = WORKFLOW_THREADS[workflowTrigger] ?? WORKFLOW_THREADS.abandoned_cart
  const initialDraft  = WORKFLOW_DRAFTS[workflowTrigger]  ?? WORKFLOW_DRAFTS.abandoned_cart

  const [thread,     setThread]     = useState<ConversationMessage[]>(initialThread)
  const [mode,       setMode]       = useState<'ai' | 'human'>('ai')
  const [aiPaused,   setAiPaused]   = useState(false)
  const [showDraft,  setShowDraft]  = useState(true)
  const [draftText,  setDraftText]  = useState(initialDraft)
  const [manualText, setManualText] = useState('')
  const [channel,    setChannel]    = useState<MessageChannel>('SMS')
  const [flashSent,  setFlashSent]  = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, showDraft])

  function sendMessage(content: string, role: 'ai' | 'operator') {
    const msg: ConversationMessage = {
      id: `m${Date.now()}`,
      role,
      channel,
      content: content.trim(),
      timestamp: 'Just now',
      status: 'sent',
    }
    setThread((prev: ConversationMessage[]) => [...prev, msg])
    setManualText('')
    setShowDraft(false)
    setFlashSent(true)
    setTimeout(() => setFlashSent(false), 2500)
  }

  function switchToHuman() { setMode('human'); setAiPaused(true)  }
  function switchToAI()    { setMode('ai');    setAiPaused(false) }

  const initials = customer.name.split(' ').map(n => n[0]).join('')

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-8 py-8">

          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 mb-5 transition-colors group"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[12px] font-medium group-hover:text-white/85 transition-colors">{workflowName}</span>
          </button>

          {/* Customer Header */}
          <div className="rounded-[14px] p-6 mb-6" style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset' }}>
            <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #003824 0%, #006b42 100%)', color: '#fff', border: '1px solid rgba(61,220,151,0.30)' }}>
                  {initials}
                </div>
                <div>
                  <div className="text-[20px] font-semibold tracking-[-0.005em]" style={{ color: 'rgba(255,255,255,0.95)' }}>{customer.name}</div>
                  <div className="text-[12.5px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{customer.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center h-5 px-2 rounded-[6px] text-[10.5px] font-medium tracking-wide"
                  style={{ background: 'rgba(0,212,255,0.10)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.25)' }}>
                  {customer.state}
                </span>
                <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-[6px] text-[10.5px] font-medium"
                  style={{ background: 'rgba(61,220,151,0.10)', color: '#3ddc97', border: '1px solid rgba(61,220,151,0.25)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3ddc97', boxShadow: '0 0 5px #3ddc97aa' }} />
                  Active in workflow
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-5 gap-5 mb-5">
              <div>
                <FieldLabel>Health Score</FieldLabel>
                <div className="mt-2"><HealthRing score={customer.healthScore} /></div>
              </div>
              <div>
                <FieldLabel>Total Spend</FieldLabel>
                <div className="text-[18px] font-bold text-white/80 mt-2">${customer.totalSpend.toLocaleString()}</div>
              </div>
              <div>
                <FieldLabel>Last Purchase</FieldLabel>
                <div className="text-[13px] font-medium text-white/55 mt-2">{customer.lastPurchase}</div>
              </div>
              <div className="col-span-2">
                <FieldLabel>Current Workflow Step</FieldLabel>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1 rounded-full" style={{ width: '60%', background: 'linear-gradient(to right, #00d4ff, #7c3aed)' }} />
                  </div>
                  <span className="text-[11px] text-white/45 whitespace-nowrap">{customer.currentStep}</span>
                </div>
              </div>
            </div>

            {/* Entry reason */}
            <div className="flex items-start gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <FieldLabel>Entry Reason</FieldLabel>
              <span className="text-[11px] text-white/40 leading-relaxed ml-3">{customer.entryReason}</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RECOVERY CONVERSATION
          ══════════════════════════════════════════ */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #00d4ff, #7c3aed)' }} />
                <div>
                  <div className="text-[13px] font-semibold text-white/85">Recovery Conversation</div>
                  <div className="text-[10px] text-white/25 mt-0.5">{thread.length} messages · {workflowName}</div>
                </div>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-3">
                {aiPaused && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
                    AI paused
                  </span>
                )}
                <div className="flex items-center gap-0.5 p-0.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={switchToAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={mode === 'ai'
                      ? { background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
                      : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }}>
                    <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                      <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="currentColor"/>
                    </svg>
                    AI Mode
                  </button>
                  <button onClick={switchToHuman}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={mode === 'human'
                      ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }
                      : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }}>
                    <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                      <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M2 14c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Human Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Thread */}
            <div className="px-6 py-6 space-y-6" style={{ background: '#08081b', minHeight: '380px' }}>
              {thread.map((msg: ConversationMessage) => {
                const isCustomer = msg.role === 'customer'
                const isOperator = msg.role === 'operator'
                return (
                  <div key={msg.id} className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={isCustomer
                        ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }
                        : isOperator
                        ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
                        : { background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                      {isCustomer ? initials : isOperator ? 'OP' : '✦'}
                    </div>
                    {/* Bubble */}
                    <div className={`flex-1 max-w-[78%] flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 mb-2 flex-wrap ${isCustomer ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] font-semibold" style={{
                          color: isCustomer ? 'rgba(255,255,255,0.45)' : isOperator ? '#f59e0b' : '#00d4ff'
                        }}>
                          {isCustomer ? customer.name : isOperator ? 'You (Operator)' : 'Revenue Recovery AI'}
                        </span>
                        <ChannelPill channel={msg.channel} />
                        <span className="text-[10px] text-white/20">{msg.timestamp}</span>
                        {!isCustomer && <StatusDot status={msg.status} />}
                      </div>
                      {msg.subject && (
                        <div className="text-[11px] font-semibold text-white/45 mb-2 w-full px-4 py-2 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          Subject: {msg.subject}
                        </div>
                      )}
                      <div className="px-4 py-3.5 rounded-xl text-[12px] leading-[1.75] whitespace-pre-line text-white/65"
                        style={isCustomer
                          ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderTopRightRadius: '3px' }
                          : isOperator
                          ? { background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', borderTopLeftRadius: '3px' }
                          : { background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderTopLeftRadius: '3px' }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* AI Draft */}
              {showDraft && !aiPaused && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>✦</div>
                  <div className="flex-1 max-w-[78%]">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-[#00d4ff]">AI Draft</span>
                      <ChannelPill channel={channel} />
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold"
                        style={{ background: 'rgba(0,212,255,0.06)', color: 'rgba(0,212,255,0.6)', border: '1px dashed rgba(0,212,255,0.2)' }}>
                        Awaiting approval
                      </span>
                    </div>
                    <textarea
                      value={draftText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftText(e.target.value)}
                      rows={6}
                      className="w-full text-[12px] leading-[1.75] rounded-xl px-4 py-3.5 resize-none"
                      style={{
                        background: 'rgba(0,212,255,0.03)',
                        color: 'rgba(255,255,255,0.62)',
                        border: '1px dashed rgba(0,212,255,0.22)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        borderTopLeftRadius: '3px',
                      }}
                    />
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <button onClick={() => sendMessage(draftText, 'ai')}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-90"
                        style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676', border: '1px solid rgba(0,230,118,0.2)' }}>
                        <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Approve & Send
                      </button>
                      <button onClick={() => setDraftText(initialDraft)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                        style={{ color: 'rgba(0,212,255,0.55)', border: '1px solid rgba(0,212,255,0.1)' }}>
                        Regenerate
                      </button>
                      <button onClick={switchToHuman}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all">
                        Edit & Send Manually
                      </button>
                      <button onClick={() => setShowDraft(false)}
                        className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/20 hover:text-white/40 transition-all">
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sent flash */}
              {flashSent && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <svg width="11" height="11" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" stroke="#00e676" strokeWidth="1.3"/>
                    <path d="M5 8l2 2 4-4" stroke="#00e676" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[11px] text-white/30">Message sent successfully</span>
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            {/* ── Compose Area ── */}
            <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {!aiPaused ? (
                  <>
                    <button onClick={() => setShowDraft(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                      style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.15)' }}>
                      <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                        <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5z" fill="currentColor"/>
                      </svg>
                      Generate Next Reply
                    </button>
                    <button onClick={switchToHuman}
                      className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium text-white/28 hover:text-white/50 hover:bg-white/[0.04] transition-all">
                      Pause AI Replies
                    </button>
                    <button onClick={switchToHuman}
                      className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium text-white/28 hover:text-white/50 hover:bg-white/[0.04] transition-all">
                      Switch to Human-Only Mode
                    </button>
                  </>
                ) : (
                  <button onClick={switchToAI}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.15)' }}>
                    Resume AI Replies
                  </button>
                )}
                {/* Channel selector */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] text-white/20">via</span>
                  {(['Email', 'SMS'] as const).map((c) => (
                    <button key={c} onClick={() => setChannel(c)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all"
                      style={channel === c
                        ? { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
                        : { color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual compose */}
              <div className="relative">
                <textarea
                  value={manualText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualText(e.target.value)}
                  placeholder={aiPaused
                    ? `Write a message to ${customer.name.split(' ')[0]}…`
                    : 'Write a manual message, or approve the AI draft above…'}
                  rows={3}
                  className="w-full text-[12px] leading-relaxed rounded-xl px-4 py-3 resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(245,158,11,0.3)' }}
                  onBlur={(e: React.FocusEvent<HTMLTextAreaElement>)  => { e.target.style.borderColor = 'rgba(255,255,255,0.07)' }}
                />
                <button
                  onClick={() => manualText.trim() && sendMessage(manualText, 'operator')}
                  disabled={!manualText.trim()}
                  className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-25 hover:opacity-90"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                  Send Manual
                  <svg width="9" height="9" fill="none" viewBox="0 0 16 16">
                    <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
          {/* end Recovery Conversation */}

        </div>
      </div>
    </div>
  )
}
