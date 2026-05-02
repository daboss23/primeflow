import { BrandSettingsForm } from '@/components/settings/BrandSettingsForm'
import { supabaseAdmin } from '@/lib/supabase'

async function getSettings() {
  const { data } = await supabaseAdmin
    .from('integrations')
    .select('*')
    .limit(1)
    .single()
  return data ?? {}
}

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <div className="p-7 max-w-[720px]">
      <div className="mb-8">
        <h2 className="text-[22px] font-semibold text-white">Brand Settings</h2>
        <p className="text-[13px] text-white/50 mt-1">
          Configure your brand voice so every AI-generated message sounds exactly like you.
        </p>
      </div>
      <BrandSettingsForm initial={settings} />
    </div>
  )
}
