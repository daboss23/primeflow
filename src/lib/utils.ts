import type { CustomerState, HealthBand } from '@/types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function daysSince(iso: string | null): number {
  if (!iso) return 9999
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function daysSinceLabel(iso: string | null): string {
  const d = daysSince(iso)
  if (d === 9999) return 'Never'
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

export function stateLabel(state: CustomerState): string {
  const labels: Record<CustomerState, string> = {
    abandoned_cart: 'Abandoned Cart',
    failed_payment: 'Failed Payment',
    dormant_buyer: 'Dormant Buyer',
    repeat_at_risk: 'VIP at Risk',
    replenishment: 'Replenishment Due',
    engaged_unconverted: 'Engaged, Not Converted',
    healthy: 'Healthy',
  }
  return labels[state]
}

export function stateColor(state: CustomerState): string {
  const colors: Record<CustomerState, string> = {
    abandoned_cart: '#ff4060',
    failed_payment: '#ff6b35',
    dormant_buyer: '#cc3355',
    repeat_at_risk: '#ffaa00',
    replenishment: '#00ccff',
    engaged_unconverted: '#a78bfa',
    healthy: '#00e676',
  }
  return colors[state]
}

export function bandColor(band: HealthBand): string {
  return { red: '#ff4060', yellow: '#ffaa00', green: '#00e676' }[band]
}

export function bandBg(band: HealthBand): string {
  return {
    red: 'linear-gradient(135deg,#8b1a2e,#c0253a)',
    yellow: 'linear-gradient(135deg,#7a4f00,#b37700)',
    green: 'linear-gradient(135deg,#005c33,#00a854)',
  }[band]
}

export function initials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.[0] ?? ''
  const l = lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '??'
}

export function fullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown'
}
