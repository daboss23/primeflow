import type {
  Customer,
  CustomerSignal,
  CustomerState,
  HealthBand,
  ScoringInput,
  ScoringOutput,
} from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = {
  ABANDONED_CART_WINDOW: 3,      // signal within 3 days = active cart
  FAILED_PAYMENT_WINDOW: 7,      // payment failed within 7 days
  DORMANT_THRESHOLD: 60,         // no purchase in 60+ days = dormant
  REPEAT_AT_RISK_THRESHOLD: 45,  // repeat buyer quiet for 45 days
  REPLENISHMENT_WINDOW: 14,      // within 14 days of expected reorder
  VIP_SPEND_THRESHOLD: 500,      // $500+ LTV = VIP
  HIGH_LTV_THRESHOLD: 1000,      // $1000+ = high LTV
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysSince(date: string | null): number {
  if (!date) return 9999
  const ms = Date.now() - new Date(date).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function hasSignal(signals: CustomerSignal[], type: string, withinDays?: number): boolean {
  return signals.some((s) => {
    if (s.signal_type !== type) return false
    if (withinDays === undefined) return true
    return daysSince(s.recorded_at) <= withinDays
  })
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(val)))
}

// ─── State Classification ────────────────────────────────────────────────────

function classifyState(customer: Customer, signals: CustomerSignal[]): CustomerState {
  const daysSincePurchase = daysSince(customer.last_purchase_at)
  const isRepeatBuyer = customer.total_orders >= 2
  const hasEngagement = (customer.email_open_rate ?? 0) > 0.1

  // Priority order matters — most urgent states first

  if (hasSignal(signals, 'failed_payment', DAYS.FAILED_PAYMENT_WINDOW)) {
    return 'failed_payment'
  }

  if (hasSignal(signals, 'abandoned_cart', DAYS.ABANDONED_CART_WINDOW)) {
    return 'abandoned_cart'
  }

  if (isRepeatBuyer && daysSincePurchase > DAYS.REPEAT_AT_RISK_THRESHOLD) {
    if (customer.total_spend >= DAYS.VIP_SPEND_THRESHOLD) {
      return 'repeat_at_risk'
    }
  }

  if (daysSincePurchase > DAYS.DORMANT_THRESHOLD && !hasEngagement) {
    return 'dormant_buyer'
  }

  if (hasSignal(signals, 'replenishment_due', DAYS.REPLENISHMENT_WINDOW)) {
    return 'replenishment'
  }

  // Engaged but never bought, or bought once + strong engagement
  if (hasEngagement && customer.total_orders <= 1 && daysSincePurchase > 30) {
    return 'engaged_unconverted'
  }

  if (daysSincePurchase > DAYS.DORMANT_THRESHOLD) {
    return 'dormant_buyer'
  }

  return 'healthy'
}

// ─── Health Score ─────────────────────────────────────────────────────────────
// 0 = worst, 100 = best

function computeHealthScore(
  customer: Customer,
  signals: CustomerSignal[],
  state: CustomerState
): number {
  let score = 50 // neutral start

  const daysSincePurchase = daysSince(customer.last_purchase_at)
  const openRate = customer.email_open_rate ?? 0
  const clickRate = customer.email_click_rate ?? 0

  // Recency
  if (daysSincePurchase <= 14) score += 25
  else if (daysSincePurchase <= 30) score += 15
  else if (daysSincePurchase <= 60) score += 0
  else if (daysSincePurchase <= 90) score -= 15
  else score -= 30

  // Frequency
  if (customer.total_orders >= 10) score += 15
  else if (customer.total_orders >= 5) score += 10
  else if (customer.total_orders >= 2) score += 5
  else score -= 5

  // Engagement
  if (openRate >= 0.4) score += 10
  else if (openRate >= 0.2) score += 5
  else if (openRate < 0.05 && customer.total_orders > 0) score -= 10

  if (clickRate >= 0.1) score += 5

  // Risk signals
  if (state === 'failed_payment') score -= 25
  if (state === 'abandoned_cart') score -= 10
  if (state === 'dormant_buyer') score -= 15
  if (state === 'repeat_at_risk') score -= 20

  // Positive signals
  if (hasSignal(signals, 'recent_reply', 14)) score += 10
  if (customer.sms_engaged) score += 5

  return clamp(score)
}

// ─── Opportunity Score ───────────────────────────────────────────────────────
// 0 = low opportunity, 100 = highest priority to act on

function computeOpportunityScore(
  customer: Customer,
  signals: CustomerSignal[],
  state: CustomerState
): number {
  let score = 40

  // High LTV = high opportunity
  if (customer.total_spend >= DAYS.HIGH_LTV_THRESHOLD) score += 25
  else if (customer.total_spend >= DAYS.VIP_SPEND_THRESHOLD) score += 15
  else if (customer.total_spend >= 200) score += 8

  // State-specific boosts
  const stateBoost: Record<CustomerState, number> = {
    failed_payment: 30,
    abandoned_cart: 25,
    repeat_at_risk: 28,
    dormant_buyer: 18,
    replenishment: 20,
    engaged_unconverted: 15,
    healthy: -10,
  }
  score += stateBoost[state] ?? 0

  // Engagement signals = higher conversion likelihood
  if ((customer.email_open_rate ?? 0) >= 0.3) score += 10
  if (hasSignal(signals, 'recent_reply', 30)) score += 12
  if (customer.sms_engaged) score += 6

  // High AOV = high revenue potential
  if (customer.average_order_value >= 150) score += 8
  else if (customer.average_order_value >= 75) score += 4

  return clamp(score)
}

// ─── Health Band ─────────────────────────────────────────────────────────────

function computeBand(health: number): HealthBand {
  if (health <= 35) return 'red'
  if (health <= 60) return 'yellow'
  return 'green'
}

// ─── Reason Codes ─────────────────────────────────────────────────────────────

function buildReasonCode(
  customer: Customer,
  signals: CustomerSignal[],
  state: CustomerState
): string {
  const daysSincePurchase = daysSince(customer.last_purchase_at)
  const name = customer.first_name ?? 'Customer'
  const hasEngage = (customer.email_open_rate ?? 0) > 0.15
  const isVip = customer.total_spend >= DAYS.VIP_SPEND_THRESHOLD

  switch (state) {
    case 'abandoned_cart': {
      const cart = signals.find((s) => s.signal_type === 'abandoned_cart')
      const product = cart?.signal_value?.product_name ?? 'a product'
      const value = cart?.signal_value?.cart_value
      return `${name} abandoned a cart${value ? ` worth $${value}` : ''} containing ${product} within the last ${DAYS.ABANDONED_CART_WINDOW} days. Direct purchase intent not completed.`
    }
    case 'failed_payment':
      return `Payment failed on ${customer.last_product_name ?? 'a recent order'}. ${isVip ? 'High-LTV customer ($' + customer.total_spend.toFixed(0) + ' total spend) ' : ''}at risk of churning without prompt recovery.`
    case 'repeat_at_risk':
      return `${isVip ? 'VIP customer' : 'Repeat buyer'} ($${customer.total_spend.toFixed(0)} LTV, ${customer.total_orders} orders) has not purchased in ${daysSincePurchase} days — above expected cadence. ${hasEngage ? 'Still opening emails.' : 'Engagement also fading.'}`
    case 'dormant_buyer':
      return `Last purchase was ${daysSincePurchase} days ago. ${hasEngage ? 'Recent email opens suggest reactivation potential.' : 'Email engagement also quiet.'} ${isVip ? 'High-value customer worth saving.' : ''}`
    case 'replenishment':
      return `Based on purchase cadence, ${name} is due to reorder ${customer.last_product_name ?? 'their last product'} now. Timely reminder can drive a high-probability repeat purchase.`
    case 'engaged_unconverted':
      return `${name} has opened emails ${Math.round((customer.email_open_rate ?? 0) * 100)}% of the time${customer.email_click_rate ? ' and clicked links' : ''} but has not yet purchased. Active intent — needs a clear next step.`
    default:
      return `Customer is active and healthy with ${customer.total_orders} orders and $${customer.total_spend.toFixed(0)} lifetime spend. No immediate action needed.`
  }
}

// ─── Suggested Actions ────────────────────────────────────────────────────────

function buildSuggestedAction(
  customer: Customer,
  state: CustomerState
): string {
  const isVip = customer.total_spend >= DAYS.VIP_SPEND_THRESHOLD
  const hasHighAov = customer.average_order_value >= 150

  switch (state) {
    case 'abandoned_cart':
      return hasHighAov
        ? 'Urgency-based cart recovery email + SMS follow-up within 1 hour'
        : 'Cart reminder email with social proof — reference specific product'
    case 'failed_payment':
      return isVip
        ? 'VIP-tone payment recovery — escalate to human follow-up if unresolved within 24 hours'
        : 'Direct payment recovery prompt with card update link'
    case 'repeat_at_risk':
      return isVip
        ? 'Concierge-style check-in — elevated tone, personalised offer, human review before send'
        : 'Loyalty recognition email — replenishment timing + soft recommendation'
    case 'dormant_buyer':
      return 'Soft win-back — reference last purchase, no pressure, clear single CTA'
    case 'replenishment':
      return 'Replenishment reminder — reference product, low-friction reorder link'
    case 'engaged_unconverted':
      return 'Reassurance email — address likely friction point, direct path back to product'
    default:
      return 'Monitor. No action needed this cycle.'
  }
}

// ─── Main Scoring Function ────────────────────────────────────────────────────

export function scoreCustomer({ customer, signals }: ScoringInput): ScoringOutput {
  const state = classifyState(customer, signals)
  const health_score = computeHealthScore(customer, signals, state)
  const opportunity_score = computeOpportunityScore(customer, signals, state)
  const health_band = computeBand(health_score)
  const reason_code = buildReasonCode(customer, signals, state)
  const suggested_action = buildSuggestedAction(customer, state)

  const signals_used = signals
    .filter((s) => daysSince(s.recorded_at) <= 90)
    .map((s) => s.signal_type)

  return {
    health_score,
    opportunity_score,
    state,
    health_band,
    reason_code,
    suggested_action,
    signals_used,
  }
}
