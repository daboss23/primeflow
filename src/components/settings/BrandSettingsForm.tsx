'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'settings' | 'vault'

interface VaultModule {
  id: string
  icon: string
  label: string
  description: string
  placeholder: string
  accent: string
}

// ─── Vault Modules ────────────────────────────────────────────────────────────

const VAULT_MODULES: VaultModule[] = [
  { id: 'voice',      icon: '🎙',  label: 'Brand Voice',          accent: '#00d4ff', description: 'How this brand speaks. Tone, personality, what it sounds like at its best.', placeholder: 'e.g. We sound like a knowledgeable friend — direct, warm, never preachy. We speak plainly and respect the reader\'s intelligence.' },
  { id: 'products',   icon: '📦',  label: 'Product Knowledge',    accent: '#a78bfa', description: 'Key products, bestsellers, bundles, and what makes each one worth talking about.', placeholder: 'e.g. Hero product: Hydrating Face Serum. Key benefit: deep moisture without heaviness. Bestseller for 3 years. Pair with the Night Recovery Cream for best results.' },
  { id: 'offers',     icon: '🎯',  label: 'Offer Rules',          accent: '#00e676', description: 'When discounts are allowed, what thresholds apply, and what the AI should never offer.', placeholder: 'e.g. Never offer more than 15% off. Only offer discounts to customers with 3+ orders. Free shipping threshold is $75. Never offer free products unprompted.' },
  { id: 'faqs',       icon: '💬',  label: 'FAQs',                 accent: '#ffaa00', description: 'Common customer questions and the exact answers the AI should give.', placeholder: 'e.g. Q: How long does shipping take? A: 3-5 business days standard, 1-2 days express. Q: Do you ship internationally? A: US, Canada, UK, and Australia only.' },
  { id: 'objections', icon: '🛡',  label: 'Objection Handling',   accent: '#ff6b35', description: 'How to respond when customers push back on price, timing, or hesitate to buy.', placeholder: 'e.g. Price objection: Focus on cost-per-use and long-term value, not the upfront price. Never apologise for pricing. Offer a smaller starter size instead of a discount.' },
  { id: 'shipping',   icon: '🚚',  label: 'Shipping & Returns',   accent: '#00ccff', description: 'Return policy, shipping rules, and anything the AI needs to know before making promises.', placeholder: 'e.g. Free returns within 30 days, no questions asked. Exchanges processed within 48 hours. Damaged items replaced immediately with photo proof.' },
  { id: 'support',    icon: '🤝',  label: 'Support Policies',     accent: '#f59e0b', description: 'What the AI can resolve itself and what should be escalated to a human.', placeholder: 'e.g. AI can handle: order status, shipping queries, product questions, return requests. Escalate to human: complaints over $200, fraud concerns, media enquiries.' },
  { id: 'founder',    icon: '✍️',  label: 'Founder Notes',        accent: '#8b5cf6', description: 'Anything the founder wants the AI to know — context, values, things that matter.', placeholder: 'e.g. We started this brand because we couldn\'t find a skincare line that was honest about ingredients. Transparency is everything. Never make claims we can\'t back up.' },
  { id: 'special',    icon: '⚡',  label: 'Special AI Instructions', accent: '#ff4060', description: 'Specific rules, edge cases, or overrides the AI must always follow.', placeholder: 'e.g. Always use first name. Never use exclamation marks more than once per message. Never compare us to competitors by name. Always close with our sign-off.' },
]

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Clear, confident, respectful' },
  { value: 'casual',       label: 'Casual',       desc: 'Warm, friendly, conversational' },
  { value: 'luxury',       label: 'Luxury',       desc: 'Elevated, refined, exclusive' },
  { value: 'bold',         label: 'Bold',         desc: 'Direct, punchy, no fluff' },
  { value: 'playful',      label: 'Playful',      desc: 'Fun, light, personality-forward' },
  { value: 'empathetic',   label: 'Empathetic',   desc: 'Warm, human-first, understanding' },
]

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls = `w-full rounded-xl px-4 py-3 text-[13px] text-white/80 placeholder-white/18 outline-none transition-all`
const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40">{label}</span>
        {hint && <span className="text-[11px] text-white/22">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </div>
  )
}

function SectionHead({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #00d4ff, #7c3aed)' }} />
        <h2 className="text-[15px] font-semibold text-white">{label}</h2>
      </div>
      {sub && <p className="text-[12px] text-white/30 ml-3">{sub}</p>}
    </div>
  )
}

// ─── Vault Module Card ────────────────────────────────────────────────────────

function VaultCard({ mod, value, onChange }: { mod: VaultModule; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(!!value)
  const filled = value.trim().length > 0

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: open ? `${mod.accent}06` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${open ? mod.accent + '22' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
            style={{ background: `${mod.accent}14` }}
          >
            {mod.icon}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white/85">{mod.label}</div>
            <div className="text-[11px] text-white/30 mt-0.5">{mod.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {filled && !open && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${mod.accent}14`, color: mod.accent }}>
              Configured
            </span>
          )}
          <svg
            width="14" height="14" fill="none" viewBox="0 0 16 16"
            className="transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'rgba(255,255,255,0.25)' }}
          >
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Card body */}
      {open && (
        <div className="px-5 pb-5">
          <textarea
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={mod.placeholder}
            className={`${inputCls} resize-none`}
            style={{ ...inputStyle, borderColor: `${mod.accent}28` }}
            onFocus={(e) => (e.target.style.borderColor = `${mod.accent}55`)}
            onBlur={(e) => (e.target.style.borderColor = `${mod.accent}28`)}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BrandSettingsForm({ initial }: { initial: Record<string, string> }) {
  const [tab, setTab] = useState<Tab>('settings')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Settings fields
  const [brandName,   setBrandName]   = useState(initial.brand_name ?? '')
  const [industry,    setIndustry]    = useState(initial.brand_industry ?? '')
  const [tagline,     setTagline]     = useState(initial.brand_tagline ?? '')
  const [tone,        setTone]        = useState(initial.brand_tone ?? 'professional')
  const [signoff,     setSignoff]     = useState(initial.brand_signoff ?? '')
  const [avoidInput,  setAvoidInput]  = useState('')
  const [avoidTags,   setAvoidTags]   = useState<string[]>(
    initial.brand_avoid ? initial.brand_avoid.split(',').map((s) => s.trim()).filter(Boolean) : []
  )

  // Vault fields
  const [vault, setVault] = useState<Record<string, string>>(
    VAULT_MODULES.reduce((acc, m) => ({ ...acc, [m.id]: initial[`vault_${m.id}`] ?? '' }), {})
  )

  const addAvoid = () => {
    const val = avoidInput.trim()
    if (val && !avoidTags.includes(val)) {
      setAvoidTags((t) => [...t, val])
      setAvoidInput('')
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const body: Record<string, string> = {
        brand_name: brandName,
        brand_industry: industry,
        brand_tagline: tagline,
        brand_tone: tone,
        brand_signoff: signoff,
        brand_avoid: avoidTags.join(', '),
        ...Object.fromEntries(Object.entries(vault).map(([k, v]) => [`vault_${k}`, v])),
      }
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const configuredVault = Object.values(vault).filter((v) => v.trim()).length

  return (
    <div className="max-w-[860px]">

      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #00d4ff, #7c3aed)' }} />
            <h1 className="text-[24px] font-bold text-white">Brand Intelligence</h1>
          </div>
          <p className="text-[13px] text-white/35 ml-4">
            Configure how the AI thinks, speaks, and recovers revenue as your brand
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#00b4d8)', color: '#fff' }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {([
          { key: 'settings', label: 'Brand Settings' },
          { key: 'vault',    label: `Brand Knowledge Vault${configuredVault > 0 ? ` · ${configuredVault} modules` : ''}` },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={tab === key
              ? { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
              : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── BRAND SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div className="space-y-4">

          {/* Identity */}
          <Panel>
            <SectionHead label="Brand Identity" sub="Core identifiers the AI uses in every interaction" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand Name">
                <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Luxe Skin Co." className={inputCls} style={inputStyle} />
              </Field>
              <Field label="Industry / Category">
                <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Skincare, Supplements, Coffee" className={inputCls} style={inputStyle} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Brand Tagline" hint="One line — what makes this brand different">
                <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Skincare that actually tells you what's in it." className={inputCls} style={inputStyle} />
              </Field>
            </div>
          </Panel>

          {/* Tone */}
          <Panel>
            <SectionHead label="Tone of Voice" sub="How the AI sounds when speaking as this brand" />
            <div className="grid grid-cols-3 gap-2.5">
              {TONES.map((t) => {
                const active = tone === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className="text-left p-3.5 rounded-xl transition-all"
                    style={active
                      ? { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)' }
                      : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    <div className="text-[13px] font-semibold mb-0.5" style={{ color: active ? '#00d4ff' : 'rgba(255,255,255,0.75)' }}>{t.label}</div>
                    <div className="text-[11px] text-white/30">{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </Panel>

          {/* Sign-off */}
          <Panel>
            <SectionHead label="Sign-Off Style" sub="How every AI message ends" />
            <Field label="Sign-Off">
              <input type="text" value={signoff} onChange={(e) => setSignoff(e.target.value)}
                placeholder="e.g. Warmly, The Luxe Skin Team" className={inputCls} style={inputStyle} />
            </Field>
          </Panel>

          {/* Words to avoid */}
          <Panel>
            <SectionHead label="Words & Phrases to Avoid" sub="The AI will never use these — ever" />
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAvoid()}
                placeholder="Type a word or phrase and press Enter"
                className={`${inputCls} flex-1`}
                style={inputStyle}
              />
              <button
                onClick={addAvoid}
                className="px-4 py-2.5 rounded-xl text-[12px] font-medium text-white/50 hover:text-white/80 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                + Add
              </button>
            </div>
            {avoidTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {avoidTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium" style={{ background: 'rgba(255,64,96,0.08)', color: '#ff4060', border: '1px solid rgba(255,64,96,0.18)' }}>
                    {tag}
                    <button onClick={() => setAvoidTags((t) => t.filter((x) => x !== tag))} className="opacity-50 hover:opacity-100 transition-opacity">×</button>
                  </span>
                ))}
              </div>
            )}
          </Panel>

        </div>
      )}

      {/* ── VAULT TAB ── */}
      {tab === 'vault' && (
        <div className="space-y-3">

          {/* Vault intro */}
          <div className="rounded-2xl px-5 py-4 flex items-start gap-4" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="text-2xl mt-0.5">🧠</div>
            <div>
              <div className="text-[14px] font-semibold text-white mb-1">Brand Knowledge Vault</div>
              <div className="text-[12px] text-white/40 leading-relaxed">
                The strategic intelligence layer behind every AI recovery conversation. The more context you give here, the more accurately the AI will represent your brand — in voice, in knowledge, and in commercial judgment.
              </div>
            </div>
            {configuredVault > 0 && (
              <div className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(0,230,118,0.08)', color: '#00e676', border: '1px solid rgba(0,230,118,0.18)' }}>
                {configuredVault}/{VAULT_MODULES.length} configured
              </div>
            )}
          </div>

          {/* Module cards */}
          {VAULT_MODULES.map((mod) => (
            <VaultCard
              key={mod.id}
              mod={mod}
              value={vault[mod.id] ?? ''}
              onChange={(v) => setVault((prev) => ({ ...prev, [mod.id]: v }))}
            />
          ))}

        </div>
      )}

    </div>
  )
}
