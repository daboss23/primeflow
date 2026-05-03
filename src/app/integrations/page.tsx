'use client'

import { useState, useEffect } from 'react'
import { Spinner, PageHeader } from '@/components/ui'

const PLATFORMS = [
  { id: 'shopify', name: 'Shopify', description: 'Sync orders, customers & products', emoji: '🛍️', color: '#96bf48', category: 'Commerce', phase: 1,
    fields: [{ key: 'store_url', placeholder: 'your-store.myshopify.com' }, { key: 'api_key', placeholder: 'API Key', type: 'password' }] },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Import WordPress store data', emoji: '🛒', color: '#7f54b3', category: 'Commerce', phase: 2,
    fields: [{ key: 'store_url', placeholder: 'https://your-store.com' }, { key: 'consumer_key', placeholder: 'Consumer Key' }, { key: 'consumer_secret', placeholder: 'Consumer Secret', type: 'password' }] },
  { id: 'klaviyo', name: 'Klaviyo', description: 'Email & SMS marketing data', emoji: '📧', color: '#00b499', category: 'Marketing', phase: 2,
    fields: [{ key: 'api_key', placeholder: 'Private API Key', type: 'password' }] },
  { id: 'zendesk', name: 'Zendesk', description: 'Customer support ticket history', emoji: '🎫', color: '#1f8eed', category: 'Support', phase: 2,
    fields: [{ key: 'subdomain', placeholder: 'your-company.zendesk.com' }, { key: 'api_token', placeholder: 'API Token', type: 'password' }] },
  { id: 'intercom', name: 'Intercom', description: 'Conversation & event data', emoji: '💬', color: '#1f8eed', category: 'Support', phase: 2,
    fields: [{ key: 'access_token', placeholder: 'Access Token', type: 'password' }] },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Campaign & list segmentation', emoji: '🐒', color: '#ffe01b', category: 'Marketing', phase: 2,
    fields: [{ key: 'api_key', placeholder: 'API Key', type: 'password' }, { key: 'server_prefix', placeholder: 'Server prefix (e.g. us1)' }] },
  { id: 'hubspot', name: 'HubSpot', description: 'CRM contacts & deal pipeline', emoji: '🔴', color: '#ff7a59', category: 'CRM', phase: 2,
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
    setFormValues(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }))
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
  const totalRecords = Object.values(connected).reduce((sum, c) => sum + c.recordsSynced, 0)

  return (
    <div className="p-6 max-w-[1100px]">

      {/* Header */}
      <PageHeader
        title="Integrations"
        subtitle="Connect your ecommerce stack to enrich customer data and trigger automated flows."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-2">Connected Platforms</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-bold text-white" style={{ fontFamily: 'var(--font-jetbrains)' }}>{connectedCount}</span>
            <span className="text-[18px] text-white/25">/ {PLATFORMS.length}</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-2">Records Synced</div>
          <div className="text-[40px] font-bold text-white" style={{ fontFamily: 'var(--font-jetbrains)' }}>
            {totalRecords > 0 ? totalRecords.toLocaleString() : '0'}
          </div>
        </div>
      </div>

      {/* Grid */}
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
              className="rounded-xl border bg-white/[0.02] flex flex-col transition-all duration-200"
              style={{ borderColor: isConnected ? 'rgba(0,230,118,0.15)' : isExpanded ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)' }}
            >
              <div className="p-5 flex flex-col gap-3">

                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0" style={{ background: `${p.color}22` }}>
                      {p.emoji}
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-white">{p.name}</div>
                      <div className="text-[12px] text-white/40 mt-0.5">{p.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: isConnected ? '#00e676' : 'rgba(255,255,255,0.2)', boxShadow: isConnected ? '0 0 4px #00e676aa' : 'none' }} />
                    <span className="text-[11px]" style={{ color: isConnected ? '#00e676' : 'rgba(255,255,255,0.3)' }}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    {p.category}
                  </span>
                  {p.phase === 1 && <span className="text-[10px] text-[#00d4ff] px-2 py-0.5 rounded-full border border-[#00d4ff]/25 bg-[#00d4ff]/[0.06]">Phase 1 ready</span>}
                  {p.phase === 2 && <span className="text-[10px] text-[#a78bfa] px-2 py-0.5 rounded-full border border-[#a78bfa]/25 bg-[#a78bfa]/[0.06]">Phase 2</span>}
                </div>

                {/* Connected state */}
                {isConnected && connData && (
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.1em] text-white/30 mb-0.5">Records Synced</div>
                        <div className="text-[13px] font-semibold text-white" style={{ fontFamily: 'var(--font-jetbrains)' }}>{connData.recordsSynced.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.1em] text-white/30 mb-0.5">Last Sync</div>
                        <div className="text-[13px] font-semibold text-white" style={{ fontFamily: 'var(--font-jetbrains)' }}>{connData.lastSync}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSyncNow(p.id)}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors disabled:opacity-40"
                      >
                        {isSyncing
                          ? <Spinner size={12} />
                          : <svg width="12" height="12" fill="none" viewBox="0 0 16 16"><path d="M2 8a6 6 0 1 0 6-6 6 6 0 0 0-4.24 1.76L2 2v4h4L4.76 4.76A4 4 0 1 1 4 8H2z" fill="currentColor"/></svg>
                        }
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        disabled={isDisconnecting}
                        className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-30"
                        title="Disconnect"
                      >
                        {isDisconnecting
                          ? <Spinner size={12} />
                          : <svg width="13" height="13" fill="none" viewBox="0 0 16 16"><path d="M6 2h4M2 5h12M5 5l.5 8h5L11 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* Not connected — connect button */}
                {!isConnected && !isExpanded && (
                  <button
                    onClick={() => setExpanded(p.id)}
                    className="w-full py-2 rounded-lg text-[12px] font-medium border border-white/[0.08] text-white/35 hover:text-white/70 hover:border-white/20 hover:bg-white/[0.03] transition-all"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Expanded inline form */}
              {isExpanded && (
                <div className="px-5 pb-4 border-t border-white/[0.05]">
                  <div className="pt-3 flex flex-col gap-2">
                    {p.fields.map(field => (
                      <input
                        key={field.key}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={fields[field.key] || ''}
                        onChange={e => handleFieldChange(p.id, field.key, e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-[#00d4ff]/40 transition-colors"
                      />
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={isConnecting}
                        className="flex-1 py-2 rounded-lg text-[12px] font-medium border border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/[0.06] hover:bg-[#00d4ff]/[0.12] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isConnecting ? <><Spinner size={11} /> Connecting...</> : 'Connect'}
                      </button>
                      <button
                        onClick={() => setExpanded(null)}
                        className="px-4 py-2 rounded-lg text-[12px] border border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/15 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-center">
        <p className="text-[12px] text-white/30">
          Shopify integration is live. Klaviyo, WooCommerce and others are coming in Phase 2.
        </p>
      </div>

    </div>
  )
}
