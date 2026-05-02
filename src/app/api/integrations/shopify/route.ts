import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { syncShopifyStore, getMockShopifyData } from '@/services/shopify'
import { scoreCustomer } from '@/lib/scoring'
import type { Customer, CustomerSignal } from '@/types'

// GET — return current integration status
export async function GET() {
  const { data } = await supabaseAdmin
    .from('integrations')
    .select('shop_domain, shopify_connected, klaviyo_connected, last_synced_at, shopify_token')
    .limit(1)
    .single()

  return NextResponse.json({
    integration: data ?? null,
    connected: data?.shopify_connected ?? false,
    has_token: !!(data?.shopify_token),
  })
}

// POST — connect store or trigger sync
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shop_domain, access_token, use_mock } = body

    // ── Demo mode: use mock data ──────────────────────────────────────────────
    if (use_mock) {
      return syncWithData(getMockShopifyData(), 'demo.myshopify.com')
    }

    // ── Real mode: validate inputs ────────────────────────────────────────────
    if (!shop_domain) {
      return NextResponse.json({ error: 'shop_domain required' }, { status: 400 })
    }

    // Clean up domain format
    const cleanDomain = shop_domain
      .replace('https://', '')
      .replace('http://', '')
      .replace(/\/$/, '')
      .trim()

    // If we have a token, use it. Otherwise check DB for existing token.
    let token = access_token
    if (!token) {
      const { data: existing } = await supabaseAdmin
        .from('integrations')
        .select('shopify_token')
        .eq('shop_domain', cleanDomain)
        .single()
      token = existing?.shopify_token
    }

    if (!token) {
      return NextResponse.json({
        error: 'No access token. Complete OAuth flow first or provide access_token.',
        oauth_url: `https://${cleanDomain}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=read_customers,read_orders,read_checkouts&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/shopify/callback`,
      }, { status: 400 })
    }

    // Save/update integration record
    await supabaseAdmin.from('integrations').upsert({
      shop_domain: cleanDomain,
      shopify_connected: true,
      shopify_token: token,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'shop_domain' })

    // Run real sync
    console.log(`[shopify] Syncing real store: ${cleanDomain}`)
    const syncData = await syncShopifyStore(cleanDomain, token)
    return syncWithData(syncData, cleanDomain)

  } catch (err) {
    console.error('[shopify POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ── Shared sync logic ─────────────────────────────────────────────────────────
async function syncWithData(
  syncData: {
    customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]
    signals: Omit<CustomerSignal, 'id' | 'customer_id'>[][]
    stats?: { customers: number; orders: number; abandoned: number }
  },
  shopDomain: string
) {
  const { customers, signals } = syncData

  // Upsert customers
  const { data: inserted, error: custErr } = await supabaseAdmin
    .from('customers')
    .upsert(
      customers.map((c) => ({ ...c, updated_at: new Date().toISOString() })),
      { onConflict: 'shopify_customer_id' }
    )
    .select()

  if (custErr) throw custErr

  const insertedCustomers = inserted as Customer[]

  // Insert signals
  const allSignals: Omit<CustomerSignal, 'id'>[] = []
  insertedCustomers.forEach((customer, i) => {
    const customerSignals = signals[i] ?? []
    customerSignals.forEach((sig) => {
      allSignals.push({ ...sig, customer_id: customer.id })
    })
  })

  if (allSignals.length > 0) {
    const customerIds = insertedCustomers.map((c) => c.id)
    await supabaseAdmin.from('customer_signals').delete().in('customer_id', customerIds)
    await supabaseAdmin.from('customer_signals').insert(allSignals)
  }

  // Run scoring
  const healthRecords = insertedCustomers.map((customer) => {
    const customerSignals = allSignals.filter(
      (s) => s.customer_id === customer.id
    ) as CustomerSignal[]
    const score = scoreCustomer({ customer, signals: customerSignals })
    return { customer_id: customer.id, ...score, scored_at: new Date().toISOString() }
  })

  await supabaseAdmin.from('customer_health').insert(healthRecords)

  // Update last synced
  await supabaseAdmin
    .from('integrations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('shop_domain', shopDomain)

  return NextResponse.json({
    ok: true,
    synced: insertedCustomers.length,
    scored: healthRecords.length,
    stats: syncData.stats ?? null,
  })
}
