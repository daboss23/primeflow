'use client'

import React, { useState, useEffect } from 'react'
import { Spinner, PageHeader, Card, SectionLabel, Pill, StatusDot, tokens, Button } from '@/components/ui'

const PLATFORMS = [
  { id: 'shopify',     name: 'Shopify',      description: 'Sync orders, customers and products',  color: '#96bf48', category: 'Commerce',  phase: 1,
    fields: [{ key: 'store_url', placeholder: 'your-store.myshopify.com' }, { key: 'api_key', placeholder: 'API Key', type: 'password' }] },
  { id: 'woocommerce', name: 'WooCommerce',  description: 'Import WordPress store data',           color: '#7f54b3', category: 'Commerce',  phase: 2,
    fields: [{ key: 'store_url', placeholder: 'https://your-store.com' }, { key: 'consumer_key', placeholder: 'Consumer Key' }, { key: 'consumer_secret', placeholder: 'Consumer Secret', type: 'password' }] },
  { id: 'klaviyo',     name: 'Klaviyo',      description: 'Email and SMS marketing data',          color: '#00b499', category: 'Marketing', phase: 2,
    fields: [{ key: 'api_key', placeholder: 'Private API Key', type: 'password' }] },
  { id: 'zendesk',     name: 'Zendesk',      description: 'Customer support ticket history',       color: '#1f8eed', category: 'Support',   phase: 2,
    fields: [{ key: 'subdomain', placeholder: 'your-company.zendesk.com' }, { key: 'api_token', placeholder: 'API Token', type: 'password' }] },
  { id: 'intercom',    name: 'Intercom',     description: 'Conversation and event data',           color: '#1f8eed', category: 'Support',   phase: 2,
    fields: [{ key: 'access_token', placeholder: 'Access Token', type: 'password' }] },
  { id: 'mailchimp',   name: 'Mailchimp',    description: 'Campaign and list segmentation',        color: '#ffe01b', category: 'Marketing', phase: 2,
    fields: [{ key: 'api_key', placeholder: 'API Key', type: 'password' }, { key: 'server_prefix', placeholder: 'Server prefix (e.g. us1)' }] },
  { id: 'hubspot',     name: 'HubSpot',      description: 'CRM contacts and deal pipeline',        color: '#ff7a59', category: 'CRM',       phase: 2,
    fields: [{ key: 'api_key', placeholder: 'Private App Token', type: 'password' }] },
]

interface ConnectedState {
  recordsSynced: number
  lastSync: string
}

export default function IntegrationsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({})
  const [connected, setConnected] = useState<Record<string, ConnectedState>>({})
  const [connecting, setConnecting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pf_integrations')
      if (saved) setConnected(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (next: Record<string, ConnectedState>) => {
    setConnected(next)
    try { localStorage.setItem('pf_integrations', JSON.stringify(next)) } catch {}
  }

  const handleFieldChange = (id: string, key: string, value: string) => {
    setFormValues((prev: Record<string, Record<string, string>>) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }))
  }

  const handleConnect = async (id: string) => {
    setConnecting(id)
    await new Promise(r => setTimeout(r, 1600))
    const now = new Date()
    const timeStr = `${now.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    persist({ ...connected, [id]: { recordsSynced: Math.floor(Math.random() * 2000) + 400, lastSync: timeStr } })
    setConnecting(null)
    setExpanded(null)
  }

  const handleSyncNow = async (id: string) => {
    setSyncing(id)
    await new Promise(r => setTimeout(r, 1800))
    const now = new Date()
    const timeStr = `${now.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    persist({ ...connected, [id]: { ...connected[id], recordsSynced: (connected[id]?.recordsSynced || 0) + Math.floor(Math.random() * 150) + 10, lastSync: timeStr } })
    setSyncing(null)
  }

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id)
    await new Promise(r => setTimeout(r, 600))
    const next = { ...connected }
    delete next[id]
    persist(next)
    setDisconnecting(null)
  }

  const connectedCount = Object.keys(connected).length
  const totalRecords = (Object.values(connected) as ConnectedState[]).reduce((sum, c) => sum + c.recordsSynced, 0)

  return (
    <div className="px-10 py-10 max-w-[1180px]">
      <PageHeader
        eyebrow="Data Sources"
        title="Integrations"
        subtitle="Connect your commerce stack to enrich customer data and trigger automated flows."
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card padded={false} className="px-5 py-5">
          <SectionLabel className="mb-3">Connected Platforms</SectionLabel>
          <div className="flex items-baseline gap-2">
            <span className="metric-num text-[34px] leading-none" style={{ color: tokens.textPrimary }}>{connectedCount}</span>
            <span className="metric-num text-[18px]" style={{ color: tokens.textMuted }}>/ {PLATFORMS.length}</span>
          </div>
        </Card>
        <Card padded={false} className="px-5 py-5">
          <SectionLabel className="mb-3">Records Synced</SectionLabel>
          <div className="metric-num text-[34px] leading-none" style={{ color: tokens.accent }}>
            {totalRecords > 0 ? totalRecords.toLocaleString() : '0'}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PLATFORMS.map((p) => {
          const isConnected = !!connected[p.id]
          const isExpanded = expanded === p.id && !isConnected
          const isConnecting = connecting === p.id
          const isSyncing = syncing === p.id
          const isDisconnecting = disconnecting === p.id
          const connData = connected[p.id]
          const fields = formValues[p.id] || {}

          return (
            <div
              key={p.id}
              className="rounded-[14px] border bg-[rgba(255,255,255,0.022)] flex flex-col transition-all"
              style={{
                borderColor: isConnected
                  ? 'rgba(61,220,151,0.22)'
                  : isExpanded
                    ? 'rgba(0,212,255,0.28)'
                    : tokens.borderSubtle,
                boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
              }}
            >
              <div className="p-5 flex flex-col gap-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 text-[13px] font-semibold metric-num"
                      style={{ background: `${p.color}1a`, color: p.color, border: `1px solid ${p.color}28`, letterSpacing: '0.04em' }}
                    >
                      {p.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{p.name}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: tokens.textTertiary }}>{p.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusDot tone={isConnected ? 'success' : 'neutral'} size={5} glow={isConnected} />
                    <span className="text-[11px] font-medium" style={{ color: isConnected ? '#3ddc97' : tokens.textMuted }}>
                      {isConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Pill tone="neutral">{p.category}</Pill>
                  {p.phase === 1 && <Pill tone="accent">Phase 1 ready</Pill>}
                  {p.phase === 2 && <Pill tone="violet">Phase 2</Pill>}
                </div>

                {isConnected && connData && (
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <SectionLabel className="!text-[9.5px] mb-1.5">Records Synced</SectionLabel>
                        <div className="metric-num text-[14px]" style={{ color: tokens.textPrimary }}>{connData.recordsSynced.toLocaleString()}</div>
                      </div>
                      <div>
                        <SectionLabel className="!text-[9.5px] mb-1.5">Last Sync</SectionLabel>
                        <div className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{connData.lastSync}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSyncNow(p.id)}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 text-[12px] font-medium transition-colors disabled:opacity-40"
                        style={{ color: tokens.textSecondary }}
                      >
                        {isSyncing
                          ? <Spinner size={12} />
                          : <svg width="12" height="12" fill="none" viewBox="0 0 16 16"><path d="M14 8a6 6 0 1 1-1.8-4.2M14 3v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                        {isSyncing ? 'Syncing…' : 'Sync now'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        disabled={isDisconnecting}
                        className="transition-colors disabled:opacity-30"
                        title="Disconnect"
                        style={{ color: tokens.textMuted }}
                      >
                        {isDisconnecting
                          ? <Spinner size={12} />
                          : <svg width="13" height="13" fill="none" viewBox="0 0 16 16"><path d="M6 2h4M2 5h12M5 5l.5 8h5L11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                )}

                {!isConnected && !isExpanded && (
                  <Button variant="secondary" className="w-full" onClick={() => setExpanded(p.id)}>Connect</Button>
                )}
              </div>

              {isExpanded && (
                <div className="px-5 pb-5" style={{ borderTop: `1px solid ${tokens.borderSubtle}` }}>
                  <div className="pt-4 flex flex-col gap-2.5">
                    {p.fields.map(field => (
                      <input
                        key={field.key}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={fields[field.key] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(p.id, field.key, e.target.value)}
                        className="w-full h-10 rounded-[10px] px-3.5 text-[13px] text-white/90 placeholder:text-white/30 transition-all
                          bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]
                          focus:outline-none focus:border-[rgba(0,212,255,0.40)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.10)]"
                      />
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Button variant="primary" className="flex-1" onClick={() => handleConnect(p.id)} disabled={isConnecting}>
                        {isConnecting ? <><Spinner size={11} /> Connecting…</> : 'Connect'}
                      </Button>
                      <Button variant="ghost" onClick={() => setExpanded(null)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-[12px] p-4 text-center" style={{ background: 'rgba(255,255,255,0.015)', border: `1px solid ${tokens.borderSubtle}` }}>
        <p className="text-[12px]" style={{ color: tokens.textMuted }}>
          Shopify integration is live. Klaviyo, WooCommerce and others are coming in Phase 2.
        </p>
      </div>
    </div>
  )
}
