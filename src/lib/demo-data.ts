import { getMockShopifyData } from '@/services/shopify'
import { scoreCustomer } from '@/lib/scoring'
import type { CustomerWithHealth, DraftChannel, DraftStatus, OutcomeType } from '@/types'

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000).toISOString()
}

function buildDemoData() {
  const { customers, signals } = getMockShopifyData()

  const health: CustomerWithHealth[] = customers.map((c, i) => {
    const id = `demo-cust-${String(i).padStart(3, '0')}`
    const customerObj = {
      id,
      created_at: daysAgo(90),
      updated_at: daysAgo(1),
      shopify_customer_id: c.shopify_customer_id,
      phone: c.phone,
      klaviyo_profile_id: c.klaviyo_profile_id,
      sms_engaged: c.sms_engaged,
      tags: c.tags,
      ...c,
    }
    const cSigs = (signals[i] ?? []).map((s, j) => ({
      id: `demo-sig-${i}-${j}`,
      customer_id: id,
      ...s,
    }))
    const scored = scoreCustomer({ customer: customerObj, signals: cSigs })
    return {
      id: `demo-health-${i}`,
      customer_id: id,
      ...scored,
      scored_at: hoursAgo(1),
      // joined customer fields (mirrors current_customer_health view)
      email:              c.email,
      first_name:         c.first_name ?? null,
      last_name:          c.last_name ?? null,
      total_spend:        c.total_spend,
      total_orders:       c.total_orders,
      average_order_value: c.average_order_value,
      last_purchase_at:   c.last_purchase_at ?? null,
      last_product_name:  c.last_product_name ?? null,
      email_open_rate:    c.email_open_rate ?? null,
      email_click_rate:   c.email_click_rate ?? null,
    }
  })

  // Sort by opportunity descending — matches real query
  const sorted = [...health].sort((a, b) => b.opportunity_score - a.opportunity_score)

  const drafts: { id: string; customer_id: string; channel: DraftChannel; status: DraftStatus; generated_at: string }[] = [
    { id: 'demo-draft-0', customer_id: sorted[0]?.customer_id ?? '', channel: 'email', status: 'generated',  generated_at: hoursAgo(2)  },
    { id: 'demo-draft-1', customer_id: sorted[1]?.customer_id ?? '', channel: 'sms',   status: 'approved',   generated_at: hoursAgo(5)  },
    { id: 'demo-draft-2', customer_id: sorted[2]?.customer_id ?? '', channel: 'email', status: 'sent',       generated_at: hoursAgo(8)  },
    { id: 'demo-draft-3', customer_id: sorted[3]?.customer_id ?? '', channel: 'email', status: 'generated',  generated_at: hoursAgo(24) },
    { id: 'demo-draft-4', customer_id: sorted[4]?.customer_id ?? '', channel: 'sms',   status: 'queued',     generated_at: hoursAgo(30) },
    { id: 'demo-draft-5', customer_id: sorted[5]?.customer_id ?? '', channel: 'email', status: 'sent',       generated_at: hoursAgo(48) },
  ]

  const outcomes: { outcome_type: OutcomeType; revenue_value: number }[] = [
    { outcome_type: 'purchased', revenue_value: 847  },
    { outcome_type: 'purchased', revenue_value: 420  },
    { outcome_type: 'purchased', revenue_value: 952  },
    { outcome_type: 'replied',   revenue_value: 0    },
    { outcome_type: 'purchased', revenue_value: 310  },
  ]

  return { health: sorted, drafts, outcomes }
}

export const DEMO = buildDemoData()
export const DEMO_COOKIE = 'axiom-demo'
