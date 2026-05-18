'use client'

import React, { useState } from 'react'
import { Card, SectionLabel, Button, Pill, tokens } from '@/components/ui'

type Tab = 'settings' | 'vault'

interface VaultModule {
  id: string
  label: string
  description: string
  placeholder: string
  accent: string
  // Monoline SVG icon
  icon: React.ReactNode
}

const Stroke = ({ children }: { children: React.ReactNode }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)

const VAULT_MODULES: VaultModule[] = [
  { id: 'voice',      accent: '#00d4ff', label: 'Brand Voice',          icon: <Stroke><path d="M5 8a3 3 0 0 1 6 0v3a3 3 0 0 1-6 0V8z"/><path d="M3 9.5v1.5a5 5 0 0 0 10 0V9.5"/><path d="M8 14v2"/></Stroke>, description: "How this brand speaks. Tone, personality, what it sounds like at its best.",                  placeholder: "e.g. We sound like a knowledgeable friend — direct, warm, never preachy. We speak plainly and respect the reader's intelligence." },
  { id: 'products',   accent: '#a78bfa', label: 'Product Knowledge',    icon: <Stroke><path d="M2 5l6-3 6 3"/><path d="M2 5v6l6 3 6-3V5"/><path d="M2 5l6 3 6-3M8 8v6"/></Stroke>, description: "Key products, bestsellers, bundles, and what makes each one worth talking about.",            placeholder: "e.g. Hero product: Hydrating Face Serum. Key benefit: deep moisture without heaviness. Bestseller for 3 years." },
  { id: 'offers',     accent: '#3ddc97', label: 'Offer Rules',          icon: <Stroke><circle cx="8" cy="8" r="6"/><path d="M5.5 8.5l2 2 3-4"/></Stroke>, description: "When discounts are allowed, what thresholds apply, and what the AI should never offer.",     placeholder: "e.g. Never offer more than 15% off. Free shipping threshold is $75. Never offer free products unprompted." },
  { id: 'faqs',       accent: '#ffaa00', label: 'FAQs',                 icon: <Stroke><path d="M2 3h12v8H5l-3 3V3z"/><path d="M6 7h4M6 9h3"/></Stroke>, description: "Common customer questions and the exact answers the AI should give.",                     placeholder: "e.g. Q: How long does shipping take? A: 3-5 business days standard, 1-2 days express." },
  { id: 'objections', accent: '#ff7a3d', label: 'Objection Handling',   icon: <Stroke><path d="M8 2l5 2v4c0 3-2 5.5-5 6-3-.5-5-3-5-6V4l5-2z"/></Stroke>, description: "How to respond when customers push back on price, timing, or hesitate to buy.",            placeholder: "e.g. Price objection: Focus on cost-per-use and long-term value, not the upfront price." },
  { id: 'shipping',   accent: '#00d4ff', label: 'Shipping & Returns',   icon: <Stroke><rect x="1.5" y="5" width="9" height="7" rx="1"/><path d="M10.5 7h3l1 2v3h-4"/><circle cx="5" cy="13" r="1.2"/><circle cx="12" cy="13" r="1.2"/></Stroke>, description: "Return policy, shipping rules, and anything the AI needs to know before promising.",         placeholder: "e.g. Free returns within 30 days, no questions asked." },
  { id: 'support',    accent: '#ffaa00', label: 'Support Policies',     icon: <Stroke><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></Stroke>, description: "What the AI can resolve itself and what should be escalated to a human.",                       placeholder: "e.g. AI can handle: order status, shipping queries, product questions. Escalate complaints over $200." },
  { id: 'founder',    accent: '#a78bfa', label: 'Founder Notes',        icon: <Stroke><path d="M12 4l-7 7-2.5.5L3 9l7-7z"/><path d="M9.5 4.5l2 2"/></Stroke>, description: "Anything the founder wants the AI to know — context, values, things that matter.",         placeholder: "e.g. We started this brand because we couldn't find a skincare line that was honest about ingredients. Transparency is everything." },
  { id: 'special',    accent: '#ff4d6a', label: 'Special AI Instructions', icon: <Stroke><path d="M8 1l-5 7h4l-1 6 5-7H7l1-6z"/></Stroke>, description: "Specific rules, edge cases, or overrides the AI must always follow.",                                  placeholder: "e.g. Always use first name. Never compare us to competitors by name. Always close with our sign-off." },
]

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Clear, confident, respectful' },
  { value: 'casual',       label: 'Casual',       desc: 'Warm, friendly, conversational' },
  { value: 'luxury',       label: 'Luxury',       desc: 'Elevated, refined, exclusive' },
  { value: 'bold',         label: 'Bold',         desc: 'Direct, punchy, no fluff' },
  { value: 'playful',      label: 'Playful',      desc: 'Fun, light, personality-forward' },
  { value: 'empathetic',   label: 'Empathetic',   desc: 'Warm, human-first, understanding' },
]

const inputCls = `w-full rounded-[10px] px-3.5 h-10 text-[13px] text-white/90 placeholder:text-white/30 outline-none transition-all
  bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
  focus:border-[rgba(0,212,255,0.40)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]`

const textareaCls = `w-full rounded-[10px] px-3.5 py-3 text-[13px] text-white/90 leading-relaxed placeholder:text-white/30 outline-none transition-all resize-none
  bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
  focus:border-[rgba(0,212,255,0.40)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]`

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <SectionLabel>{label}</SectionLabel>
        {hint && <span className="text-[11px]" style={{ color: tokens.textMuted }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function SectionHead({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[15px] font-semibold mb-1" style={{ color: tokens.textPrimary, letterSpacing: '-0.005em' }}>{label}</h2>
      {sub && <p className="text-[12.5px]" style={{ color: tokens.textTertiary }}>{sub}</p>}
    </div>
  )
}

function VaultCard({ mod, value, onChange }: { mod: VaultModule; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(!!value)
  const filled = value.trim().length > 0

  return (
    <div
      className="rounded-[14px] overflow-hidden transition-all"
      style={{
        background: open ? `${mod.accent}07` : tokens.surface,
        border: `1px solid ${open ? mod.accent + '28' : tokens.borderSubtle}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${mod.accent}12`, color: mod.accent, border: `1px solid ${mod.accent}22` }}
          >
            {mod.icon}
          </div>
          <div>
            <div className="text-[13.5px] font-semibold" style={{ color: tokens.textPrimary }}>{mod.label}</div>
            <div className="text-[12px] mt-0.5" style={{ color: tokens.textTertiary }}>{mod.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {filled && !open && (
            <span className="inline-flex items-center h-5 px-2 rounded-[6px] text-[10.5px] font-medium"
              style={{ background: `${mod.accent}14`, color: mod.accent, border: `1px solid ${mod.accent}28` }}>
              Configured
            </span>
          )}
          <svg
            width="14" height="14" fill="none" viewBox="0 0 16 16"
            className="transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: tokens.textMuted }}
          >
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <textarea
            rows={4}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            placeholder={mod.placeholder}
            className={textareaCls}
            style={{ borderColor: `${mod.accent}28` }}
            onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.target.style.borderColor = `${mod.accent}55`)}
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => (e.target.style.borderColor = `${mod.accent}28`)}
          />
        </div>
      )}
    </div>
  )
}

export function BrandSettingsForm({ initial }: { initial: Record<string, string> }) {
  const [tab, setTab] = useState<Tab>('settings')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [brandName,   setBrandName]   = useState(initial.brand_name ?? '')
  const [industry,    setIndustry]    = useState(initial.brand_industry ?? '')
  const [tagline,     setTagline]     = useState(initial.brand_tagline ?? '')
  const [tone,        setTone]        = useState(initial.brand_tone ?? 'professional')
  const [signoff,     setSignoff]     = useState(initial.brand_signoff ?? '')
  const [avoidInput,  setAvoidInput]  = useState('')
  const [avoidTags,   setAvoidTags]   = useState<string[]>(
    initial.brand_avoid ? initial.brand_avoid.split(',').map((s) => s.trim()).filter(Boolean) : []
  )

  const [vault, setVault] = useState<Record<string, string>>(
    VAULT_MODULES.reduce<Record<string, string>>((acc, m) => ({ ...acc, [m.id]: initial[`vault_${m.id}`] ?? '' }), {})
  )

  const addAvoid = () => {
    const val = avoidInput.trim()
    if (val && !avoidTags.includes(val)) {
      setAvoidTags((t: string[]) => [...t, val])
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

  const configuredVault = (Object.values(vault) as string[]).filter((v) => v.trim()).length

  return (
    <div>
      {/* Tabs + Save */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-0.5 p-0.5 rounded-[10px]"
             style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.borderSubtle}` }}>
          {([
            { key: 'settings', label: 'Brand Settings' },
            { key: 'vault',    label: `Brand Knowledge Vault${configuredVault > 0 ? ` · ${configuredVault}` : ''}` },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="h-8 px-3.5 rounded-[7px] text-[12px] font-medium transition-all"
              style={
                tab === key
                  ? { background: 'rgba(0,212,255,0.10)', color: '#00d4ff', boxShadow: '0 0 0 1px rgba(0,212,255,0.25) inset' }
                  : { color: tokens.textTertiary, background: 'transparent' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <SectionHead label="Brand Identity" sub="Core identifiers the AI uses in every interaction." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Brand Name">
                <input type="text" value={brandName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandName(e.target.value)} placeholder="e.g. Luxe Skin Co." className={inputCls} />
              </Field>
              <Field label="Industry / Category">
                <input type="text" value={industry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndustry(e.target.value)} placeholder="e.g. Skincare, Supplements, Coffee" className={inputCls} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Brand Tagline" hint="One line — what makes this brand different">
                <input type="text" value={tagline} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagline(e.target.value)} placeholder="e.g. Skincare that actually tells you what's in it." className={inputCls} />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHead label="Tone of Voice" sub="How the AI sounds when speaking as this brand." />
            <div className="grid grid-cols-3 gap-2.5">
              {TONES.map((t) => {
                const active = tone === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className="text-left p-4 rounded-[12px] transition-all"
                    style={
                      active
                        ? { background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.35)' }
                        : { background: 'rgba(255,255,255,0.022)', border: `1px solid ${tokens.borderSubtle}` }
                    }
                  >
                    <div className="text-[13.5px] font-semibold mb-1" style={{ color: active ? '#00d4ff' : tokens.textPrimary }}>{t.label}</div>
                    <div className="text-[11.5px]" style={{ color: tokens.textTertiary }}>{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <SectionHead label="Sign-Off Style" sub="How every AI message ends." />
            <Field label="Sign-Off">
              <input type="text" value={signoff} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignoff(e.target.value)} placeholder="e.g. Warmly, The Luxe Skin Team" className={inputCls} />
            </Field>
          </Card>

          <Card>
            <SectionHead label="Words & Phrases to Avoid" sub="The AI will never use these — ever." />
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={avoidInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvoidInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addAvoid())}
                placeholder="Type a word or phrase and press Enter"
                className={`${inputCls} flex-1`}
              />
              <Button variant="secondary" onClick={addAvoid}>+ Add</Button>
            </div>
            {avoidTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {avoidTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 h-7 pl-3 pr-2 rounded-[8px] text-[12px] font-medium"
                    style={{ background: 'rgba(255,77,106,0.08)', color: '#ff4d6a', border: '1px solid rgba(255,77,106,0.22)' }}
                  >
                    {tag}
                    <button onClick={() => setAvoidTags((t: string[]) => t.filter((x: string) => x !== tag))} className="opacity-60 hover:opacity-100 transition-opacity text-[14px] leading-none">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VAULT TAB */}
      {tab === 'vault' && (
        <div className="space-y-3">
          <div
            className="rounded-[14px] px-5 py-4 flex items-start gap-4"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.18)' }}
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.10)', border: '1px solid rgba(0,212,255,0.24)', color: '#00d4ff' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 4a3 3 0 1 1 6 0v1a3 3 0 0 1 0 6 3 3 0 0 1-6 0 3 3 0 0 1 0-6V4z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>Brand Knowledge Vault</div>
              <div className="text-[12.5px] mt-1 leading-relaxed" style={{ color: tokens.textTertiary }}>
                The strategic intelligence layer behind every AI recovery conversation. The more context you give, the more accurately the AI represents your brand — in voice, knowledge, and commercial judgement.
              </div>
            </div>
            {configuredVault > 0 && (
              <Pill tone="success">{configuredVault}/{VAULT_MODULES.length} configured</Pill>
            )}
          </div>

          {VAULT_MODULES.map((mod) => (
            <VaultCard
              key={mod.id}
              mod={mod}
              value={vault[mod.id] ?? ''}
              onChange={(v) => setVault((prev: Record<string, string>) => ({ ...prev, [mod.id]: v }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
