import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function generateId() {
  return Math.random().toString(36).substring(2, 8) +
    Math.random().toString(36).substring(2, 8)
}

// POST /api/report — save a report, return shareable ID
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = generateId()

    const { error } = await supabaseAdmin
      .from('revenue_reports')
      .insert({
        id,
        email: body.email ?? null,
        store_url: body.store_url ?? null,
        industry: body.industry ?? null,
        monthly_customers: body.monthly_customers,
        aov: body.aov,
        monthly_revenue: body.monthly_revenue,
        current_recovery: body.current_recovery ?? 0,
        total_at_risk: body.total_at_risk,
        total_recoverable: body.total_recoverable,
        results_json: body.results_json,
      })

    if (error) throw error

    return NextResponse.json({ id })
  } catch (err) {
    console.error('Report save error:', err)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}

// GET /api/report?id=xxx — retrieve a saved report
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('revenue_reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    return NextResponse.json({ report: data })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
