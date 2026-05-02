import { supabaseAdmin } from '@/lib/supabase'
import { ConnectShopify } from '@/components/integrations/ConnectShopify'

async function getIntegration() {
  const { data } = await supabaseAdmin
    .from('integrations')
    .select('shop_domain, shopify_connected, last_synced_at')
    .limit(1)
    .single()
  return data
}

export default async function ConnectPage() {
  const integration = await getIntegration()

  return (
    <div className="p-7 max-w-[640px]">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 rounded-full bg-[#00d4ff]" />
          <h1 className="text-[26px] font-bold text-white">Connect Your Store</h1>
        </div>
        <p className="text-[14px] text-white/45 ml-4">
          Connect your Shopify store to pull real customer data and run the scoring engine.
        </p>
      </div>
      <ConnectShopify
        connected={integration?.shopify_connected ?? false}
        shopDomain={integration?.shop_domain ?? null}
        lastSynced={integration?.last_synced_at ?? null}
      />
    </div>
  )
}