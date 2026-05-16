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
    <div className="px-10 py-10 max-w-[840px]">
      <PageHeader
        eyebrow="Brand Vault"
        title="Brand Knowledge"
        subtitle="Configure your brand voice, values, and guardrails so every AI-generated message sounds exactly like you."
      />
      <BrandSettingsForm initial={settings ?? {}} />
    </div>
  )
}
