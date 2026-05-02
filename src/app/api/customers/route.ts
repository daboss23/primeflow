import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { HealthBand, CustomerState } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const band = searchParams.get('band') as HealthBand | null
  const state = searchParams.get('state') as CustomerState | null
  const limit = parseInt(searchParams.get('limit') ?? '100')

  try {
    let query = supabaseAdmin
      .from('current_customer_health')
      .select('*')
      .order('opportunity_score', { ascending: false })
      .limit(limit)

    if (band) query = query.eq('health_band', band)
    if (state) query = query.eq('state', state)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ customers: data })
  } catch (err) {
    console.error('[customers GET]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
