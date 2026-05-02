import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getMockShopifyData } from '@/services/shopify'
import { scoreCustomer } from '@/lib/scoring'
import type { Customer, CustomerSignal } from '@/types'

export async function POST() {
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

    // Insert signals for each customer
    const allSignals: Omit<CustomerSignal, 'id'>[] = []
    insertedCustomers.forEach((customer, i) => {
      const customerSignals = signals[i] ?? []
      customerSignals.forEach((sig) => {
        allSignals.push({ ...sig, customer_id: customer.id })
      })
    })

    if (allSignals.length > 0) {
      // Clear old signals first for clean re-seed
      const customerIds = insertedCustomers.map((c) => c.id)
      await supabaseAdmin
        .from('customer_signals')
        .delete()
        .in('customer_id', customerIds)

      await supabaseAdmin.from('customer_signals').insert(allSignals)
    }

    // Run scoring for all seeded customers
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

    const { error: healthErr } = await supabaseAdmin
      .from('customer_health')
      .insert(healthRecords)

    if (healthErr) throw healthErr

    return NextResponse.json({
      ok: true,
      seeded: insertedCustomers.length,
      scored: healthRecords.length,
    })
  } catch (err) {
    console.error('[seed]', err)
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    )
  }
}
