// ─── Enums ──────────────────────────────────────────────────────────────────

export type HealthBand = 'red' | 'yellow' | 'green'

export type CustomerState =
  | 'abandoned_cart'
  | 'failed_payment'
  | 'dormant_buyer'
  | 'repeat_at_risk'
  | 'replenishment'
  | 'engaged_unconverted'
  | 'healthy'

export type DraftChannel = 'email' | 'sms'

export type DraftStatus =
  | 'generated'
  | 'approved'
  | 'queued'
  | 'sent'
  | 'skipped'
  | 'escalated'

export type OutcomeType =
  | 'replied'
  | 'purchased'
  | 'no_action'
  | 'unsubscribed'
  | 'escalated'
  | 'bounced'

// ─── Database Row Types ──────────────────────────────────────────────────────

export interface Customer {
  id: string
  shopify_customer_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  total_spend: number
  total_orders: number
  average_order_value: number
  last_purchase_at: string | null
  last_product_name: string | null
  klaviyo_profile_id: string | null
  email_open_rate: number | null
  email_click_rate: number | null
  sms_engaged: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CustomerSignal {
  id: string
  customer_id: string
  signal_type: string
  signal_value: Record<string, unknown>
  signal_source: string
  recorded_at: string
}

export interface CustomerHealth {
  id: string
  customer_id: string
  health_score: number
  opportunity_score: number
  state: CustomerState
  health_band: HealthBand
  reason_code: string
  suggested_action: string
  signals_used: string[]
  scored_at: string
}

export interface OutreachDraft {
  id: string
  customer_id: string
  health_id: string | null
  channel: DraftChannel
  draft_text: string
  subject_line: string | null
  prompt_version: string
  status: DraftStatus
  generated_at: string
  approved_at: string | null
  sent_at: string | null
  approved_by: string | null
}

export interface Outcome {
  id: string
  customer_id: string
  draft_id: string | null
  outcome_type: OutcomeType
  revenue_value: number
  occurred_at: string
  notes: string | null
  source: string
}

// ─── Composite / View Types ──────────────────────────────────────────────────

export interface CustomerWithHealth extends CustomerHealth {
  email: string
  first_name: string | null
  last_name: string | null
  total_spend: number
  total_orders: number
  average_order_value: number
  last_purchase_at: string | null
  last_product_name: string | null
  email_open_rate: number | null
  email_click_rate: number | null
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface DraftRequest {
  customer_id: string
  channel: DraftChannel
}

export interface DraftResponse {
  draft: OutreachDraft
}

export interface ScoreRequest {
  customer_ids?: string[]
  // if empty, scores all customers
}

export interface ScoreResponse {
  scored: number
  results: CustomerHealth[]
}

export interface OutcomeRequest {
  customer_id: string
  draft_id?: string
  outcome_type: OutcomeType
  revenue_value?: number
  notes?: string
}

export interface UpdateDraftStatusRequest {
  draft_id: string
  status: DraftStatus
  approved_by?: string
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface HealthDistribution {
  red: number
  yellow: number
  green: number
  total: number
}

export interface AnalyticsSummary {
  health_distribution: HealthDistribution
  at_risk_revenue: number
  drafts_generated: number
  drafts_approved: number
  drafts_sent: number
  reply_rate: number
  conversion_rate: number
  recovered_revenue: number
  by_state: StateBreakdown[]
  outreach_by_channel: ChannelBreakdown[]
}

export interface StateBreakdown {
  state: CustomerState
  count: number
  converted: number
  revenue: number
}

export interface ChannelBreakdown {
  channel: DraftChannel
  sent: number
  replied: number
  converted: number
}

// ─── Scoring Engine Types ─────────────────────────────────────────────────────

export interface ScoringInput {
  customer: Customer
  signals: CustomerSignal[]
}

export interface ScoringOutput {
  health_score: number
  opportunity_score: number
  state: CustomerState
  health_band: HealthBand
  reason_code: string
  suggested_action: string
  signals_used: string[]
}

// ─── Integration Types ────────────────────────────────────────────────────────

export interface ShopifyCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  orders_count: number
  total_spent: string
  tags: string
  created_at: string
  updated_at: string
}

export interface ShopifyOrder {
  id: string
  customer: { id: string }
  total_price: string
  line_items: Array<{ title: string; price: string }>
  created_at: string
  financial_status: string
}

export interface KlaviyoProfile {
  id: string
  email: string
  properties: {
    open_rate?: number
    click_rate?: number
    sms_consent?: boolean
  }
}
