import { supabaseAdmin } from '@/lib/supabase'
import { ConnectShopify } from '@/components/integrations/ConnectShopify'
import { PageHeader } from '@/components/ui/PageHeader'

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
    <div className="px-10 py-10 max-w-[720px]">
      <PageHeader
        eyebrow="Setup"
        title="Connect Your Store"
        subtitle="Connect Shopify to pull real customer data and run the scoring engine."
      />
      <ConnectShopify
        connected={integration?.shopify_connected ?? false}
        shopDomain={integration?.shop_domain ?? null}
        lastSynced={integration?.last_synced_at ?? null}
      />
    </div>
  )
}
