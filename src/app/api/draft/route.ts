import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateDraft } from '@/lib/ai'
import type { Customer, CustomerHealth, DraftChannel, DraftStatus } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { customer_id, channel } = await req.json() as {
      customer_id: string
      channel: DraftChannel
    }

    if (!customer_id || !channel) {
      return NextResponse.json({ error: 'customer_id and channel required' }, { status: 400 })
    }

    // Fetch customer
    const { data: customer, error: custErr } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customer_id)
      .single()
    if (custErr) throw new Error('Customer not found')

    // Fetch latest health record
    const { data: health, error: healthErr } = await supabaseAdmin
      .from('customer_health')
      .select('*')
      .eq('customer_id', customer_id)
      .order('scored_at', { ascending: false })
      .limit(1)
      .single()
    if (healthErr) throw new Error('No health record found — run scoring first')

    // Fetch brand settings from integrations
    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('brand_name, brand_tone, brand_voice_description, brand_signoff, brand_avoid, brand_example_good, brand_example_bad, brand_industry')
      .limit(1)
      .single()

    // Generate draft with brand voice
    const { draft_text, subject_line, prompt_version } = await generateDraft(
      customer as Customer,
      health as CustomerHealth,
      channel,
      integration ?? {}
    )

    // Store draft
    const { data: draft, error: draftErr } = await supabaseAdmin
      .from('outreach_drafts')
      .insert({
        customer_id,
        health_id: health.id,
        channel,
        draft_text,
        subject_line,
        prompt_version,
        status: 'generated',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (draftErr) throw draftErr

    return NextResponse.json({ draft })
  } catch (err) {
    console.error('[draft POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { draft_id, status, approved_by } = await req.json() as {
      draft_id: string
      status: DraftStatus
      approved_by?: string
    }

    const updates: Record<string, unknown> = { status }
    if (status === 'approved') updates.approved_at = new Date().toISOString()
    if (status === 'sent') updates.sent_at = new Date().toISOString()
    if (approved_by) updates.approved_by = approved_by

    const { data, error } = await supabaseAdmin
      .from('outreach_drafts')
      .update(updates)
      .eq('id', draft_id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ draft: data })
  } catch (err) {
    console.error('[draft PATCH]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const customer_id = req.nextUrl.searchParams.get('customer_id')
  if (!customer_id) {
    return NextResponse.json({ error: 'customer_id required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('outreach_drafts')
    .select('*')
    .eq('customer_id', customer_id)
    .order('generated_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 })
  return NextResponse.json({ drafts: data })
}
