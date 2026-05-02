import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { scoreCustomer } from '@/lib/scoring'
import type { Customer, CustomerSignal } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const customerIds: string[] | undefined = body.customer_ids

    // Fetch customers
    let custQuery = supabaseAdmin.from('customers').select('*')
    if (customerIds?.length) custQuery = custQuery.in('id', customerIds)
    const { data: customers, error: custErr } = await custQuery
    if (custErr) throw custErr

    // Fetch signals
    const ids = (customers as Customer[]).map((c) => c.id)
    const { data: signals, error: sigErr } = await supabaseAdmin
      .from('customer_signals')
      .select('*')
      .in('customer_id', ids)
    if (sigErr) throw sigErr

    // Score each customer
    const healthRecords = (customers as Customer[]).map((customer) => {
      const customerSignals = (signals as CustomerSignal[]).filter(
        (s) => s.customer_id === customer.id
      )
      const score = scoreCustomer({ customer, signals: customerSignals })
      return {
        customer_id: customer.id,
        ...score,
        scored_at: new Date().toISOString(),
      }
    })

    // Insert new health records (keep history)
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('customer_health')
      .insert(healthRecords)
      .select()

    if (insertErr) throw insertErr

    return NextResponse.json({
      scored: healthRecords.length,
      results: inserted,
    })
  } catch (err) {
    console.error('[score POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
