import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('integrations')
    .select('*')
    .limit(1)
    .single()
  return NextResponse.json({ settings: data ?? {} })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      brand_name, brand_tone, brand_voice_description,
      brand_signoff, brand_avoid, brand_example_good,
      brand_example_bad, brand_industry,
    } = body

    const { data: existing } = await supabaseAdmin
      .from('integrations')
      .select('id, shop_domain')
      .limit(1)
      .single()

    const updates = {
      brand_name, brand_tone, brand_voice_description,
      brand_signoff, brand_avoid, brand_example_good,
      brand_example_bad, brand_industry,
      updated_at: new Date().toISOString(),
    }

    if (existing?.id) {
      await supabaseAdmin
        .from('integrations')
        .update(updates)
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('integrations')
        .insert({ ...updates, shop_domain: 'demo.myshopify.com', shopify_connected: false, klaviyo_connected: false })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[settings POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
