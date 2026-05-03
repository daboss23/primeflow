import { BrandSettingsForm } from '@/components/settings/BrandSettingsForm'
import { PageHeader } from '@/components/ui/PageHeader'

async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/settings`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <div className="p-7 max-w-[720px]">
      <PageHeader
        title="Brand Settings"
        subtitle="Configure your brand voice so every AI-generated message sounds exactly like you."
      />
      <BrandSettingsForm initial={settings ?? {}} />
    </div>
  )
}
