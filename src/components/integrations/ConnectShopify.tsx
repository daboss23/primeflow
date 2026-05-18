'use client'

import React, { useState } from 'react'

interface Props {
  connected?: boolean
  shopDomain?: string | null
  lastSynced?: string | null
}

export function ConnectShopify({ connected, shopDomain, lastSynced }: Props) {
  const [domain, setDomain] = useState(shopDomain ?? '')
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(connected ?? false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    if (!domain || !token) {
      setError('Please fill in both fields')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/integrations/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_domain: domain, access_token: token }),
      })
      if (!res.ok) throw new Error('Failed to connect')
      setSuccess(true)
    } catch (e) {
      setError('Connection failed. Check your credentials and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 max-w-lg">
      <div className="text-[11px] uppercase tracking-[0.12em] text-white/40 mb-5">
        Shopify Credentials
      </div>

      {success ? (
        <div className="rounded-xl border border-[#00e676]/25 bg-[#00e676]/[0.06] p-5 text-center">
          <div className="text-[#00e676] text-[18px] font-semibold mb-1">✓ Connected!</div>
          <div className="text-[13px] text-white/50">
            {shopDomain ? `Connected to ${shopDomain}` : 'Your Shopify store is now connected.'}
          </div>
          {lastSynced && (
            <div className="text-[11px] text-white/30 mt-1">Last synced: {lastSynced}</div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-white/70 block mb-2">
              Shop domain
            </label>
            <input
              type="text"
              placeholder="yourstore.myshopify.com"
              value={domain}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-[#00d4ff]/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-white/70 block mb-2">
              Access token
            </label>
            <input
              type="password"
              placeholder="shpat_..."
              value={token}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-[#00d4ff]/40 transition-colors"
            />
          </div>

          {error && (
            <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}
          >
            {saving ? 'Connecting...' : 'Connect Shopify →'}
          </button>
        </div>
      )}
    </div>
  )
}
