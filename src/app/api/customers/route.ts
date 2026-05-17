import { NextRequest, NextResponse } from 'next/server'
import { hasSupabase, supabaseAdmin } from '@/lib/supabase'
import { DEMO, DEMO_COOKIE } from '@/lib/demo-data'
import type { HealthBand, CustomerState } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams, cookies } = req.nextUrl
  const band  = searchParams.get('band')  as HealthBand  | null
  const state = searchParams.get('state') as CustomerState | null
  const limit = parseInt(searchParams.get('limit') ?? '100')

  const isDemo = !hasSupabase || req.cookies.get(DEMO_COOKIE)?.value === '1'

  if (isDemo) {
    let data = DEMO.health
    if (band)  data = data.filter((c) => c.health_band === band)
    if (state) data = data.filter((c) => c.state === state)
    data = data.slice(0, limit)
    return NextResponse.json({ customers: data })
  }

  try {
    let query = supabaseAdmin
      .from('current_customer_health')
      .select('*')
      .order('opportunity_score', { ascending: false })
      .limit(limit)

    if (band)  query = query.eq('health_band', band)
    if (state) query = query.eq('state', state)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ customers: data })
  } catch (err) {
    console.error('[customers GET]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
