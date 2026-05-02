import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { shop_domain, api_key } = await req.json()

    if (!shop_domain) {
      return NextResponse.json({ error: 'shop_domain required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('integrations')
      .upsert({
        shop_domain,
        klaviyo_connected: !!api_key,
        klaviyo_api_key: api_key ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'shop_domain' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ integration: data })
  } catch (err) {
    console.error('[klaviyo POST]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
