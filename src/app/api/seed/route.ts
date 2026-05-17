import { NextResponse } from 'next/server'
import { hasSupabase, supabaseAdmin } from '@/lib/supabase'
import { getMockShopifyData } from '@/services/shopify'
import { scoreCustomer } from '@/lib/scoring'
import { DEMO, DEMO_COOKIE } from '@/lib/demo-data'
import type { Customer, CustomerSignal } from '@/types'

// ─── Demo-mode seed (no Supabase required) ────────────────────────────────────

function demoResponse() {
  const res = NextResponse.json({
    ok: true,
    seeded: DEMO.health.length,
    scored: DEMO.health.length,
    demo: true,
  })
  res.cookies.set(DEMO_COOKIE, '1', { path: '/', maxAge: 60 * 60 * 24 * 7, httpOnly: false })
  return res
}

// ─── Real Supabase seed ───────────────────────────────────────────────────────

export async function POST() {
  if (!hasSupabase) return demoResponse()

  try {
    const { customers, signals } = getMockShopifyData()

    // Upsert integration record
    await supabaseAdmin.from('integrations').upsert({
      shop_domain: 'demo.myshopify.com',
      shopify_connected: true,
      klaviyo_connected: true,
    }, { onConflict: 'shop_domain' })

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

    // Rebuild signals for each customer
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

    // Score all customers — upsert to avoid duplicate health rows on re-seed
    const healthRecords = insertedCustomers.map((customer) => {
      const customerSignals = allSignals.filter(
        (s) => s.customer_id === customer.id
      ) as CustomerSignal[]
      const score = scoreCustomer({ customer, signals: customerSignals })
      return {
        customer_id: customer.id,
        ...score,
        scored_at: new Date().toISOString(),
      }
    })

    // Delete old health rows for these customers, then insert fresh
    await supabaseAdmin
      .from('customer_health')
      .delete()
      .in('customer_id', insertedCustomers.map((c) => c.id))

    const { error: healthErr } = await supabaseAdmin.from('customer_health').insert(healthRecords)
    if (healthErr) throw healthErr

    const res = NextResponse.json({
      ok: true,
      seeded: insertedCustomers.length,
      scored: healthRecords.length,
    })
    res.cookies.set(DEMO_COOKIE, '0', { path: '/', maxAge: 0 }) // clear demo cookie when real data seeded
    return res
  } catch (err) {
    console.error('[seed]', err)
    // Fall back to demo mode rather than showing an error
    return demoResponse()
  }
}
