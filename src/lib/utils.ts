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
    abandoned_cart:      '#ff4d6a',
    failed_payment:      '#ff7a3d',
    dormant_buyer:       '#d1426b',
    repeat_at_risk:      '#ffaa00',
    replenishment:       '#00d4ff',
    engaged_unconverted: '#a78bfa',
    healthy:             '#3ddc97',
  }
  return colors[state]
}

export function bandColor(band: HealthBand): string {
  return { red: '#ff4d6a', yellow: '#ffaa00', green: '#3ddc97' }[band]
}

export function bandBg(band: HealthBand): string {
  return {
    red:    'linear-gradient(135deg, #4a0d1a 0%, #7d1a30 100%)',
    yellow: 'linear-gradient(135deg, #3d2a00 0%, #6e4d00 100%)',
    green:  'linear-gradient(135deg, #003824 0%, #006b42 100%)',
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
