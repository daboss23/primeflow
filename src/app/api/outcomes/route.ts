import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { OutcomeType } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { customer_id, draft_id, outcome_type, revenue_value, notes } =
      await req.json() as {
        customer_id: string
        draft_id?: string
        outcome_type: OutcomeType
        revenue_value?: number
        notes?: string
      }

    if (!customer_id || !outcome_type) {
      return NextResponse.json(
        { error: 'customer_id and outcome_type required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('outcomes')
      .insert({
        customer_id,
        draft_id: draft_id ?? null,
        outcome_type,
        revenue_value: revenue_value ?? 0,
        notes: notes ?? null,
        occurred_at: new Date().toISOString(),
        source: 'manual',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ outcome: data })
  } catch (err) {
    console.error('[outcomes POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const customer_id = req.nextUrl.searchParams.get('customer_id')

  try {
    let query = supabaseAdmin
      .from('outcomes')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(50)

    if (customer_id) query = query.eq('customer_id', customer_id)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ outcomes: data })
  } catch (err) {
    console.error('[outcomes GET]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
