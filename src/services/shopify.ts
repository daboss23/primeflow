/**
 * Shopify Admin API Service
 *
 * Phase 1: Mock data for demo
 * Phase 2: Real OAuth + API calls (structure already in place)
 *
 * To activate real Shopify:
 * 1. Complete OAuth flow to get access token
 * 2. Store token in integrations table
 * 3. Replace getMockShopifyData() calls with fetchReal*() functions below
 */

import type { Customer, CustomerSignal } from '@/types'

const SHOPIFY_API_VERSION = '2024-10'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopifyCustomerRaw {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  orders_count: number
  total_spent: string
  tags: string
  created_at: string
  updated_at: string
  note: string | null
}

interface ShopifyOrderRaw {
  id: number
  customer: { id: number }
  total_price: string
  financial_status: string
  line_items: Array<{ title: string; price: string }>
  created_at: string
}

interface ShopifyAbandonedCheckoutRaw {
  id: number
  email: string
  total_price: string
  line_items: Array<{ title: string; price: string }>
  created_at: string
  updated_at: string
}

// ─── Real API: Customers ──────────────────────────────────────────────────────

export async function fetchShopifyCustomers(
  shopDomain: string,
  accessToken: string
): Promise<ShopifyCustomerRaw[]> {
  const customers: ShopifyCustomerRaw[] = []
  let url: string | null =
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/customers.json?limit=250`

  // Handle pagination
  while (url) {
    const res: Response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    customers.push(...data.customers)

    // Check for next page via Link header
    const linkHeader: string | null = res.headers.get('Link')
    const nextMatch = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel="next"/) : null
    url = nextMatch ? nextMatch[1] : null
  }

  return customers
}

// ─── Real API: Orders ─────────────────────────────────────────────────────────

export async function fetchShopifyOrders(
  shopDomain: string,
  accessToken: string,
  sinceDate?: string
): Promise<ShopifyOrderRaw[]> {
  const orders: ShopifyOrderRaw[] = []
  const since = sinceDate ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  let url: string | null =
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250&created_at_min=${since}`

  while (url) {
    const res: Response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) throw new Error(`Shopify orders API error: ${res.status}`)

    const data = await res.json()
    orders.push(...data.orders)

    const linkHeader: string | null = res.headers.get('Link')
    const nextMatch = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel="next"/) : null
    url = nextMatch ? nextMatch[1] : null
  }

  return orders
}

// ─── Real API: Abandoned Checkouts ───────────────────────────────────────────

export async function fetchAbandonedCheckouts(
  shopDomain: string,
  accessToken: string
): Promise<ShopifyAbandonedCheckoutRaw[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const res: Response = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/checkouts.json?limit=250&created_at_min=${since}`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) throw new Error(`Shopify checkouts API error: ${res.status}`)
  const data = await res.json()
  return data.checkouts ?? []
}

// ─── Transform: Shopify → PRIMEFLOW customer format ──────────────────────────

export function transformShopifyCustomers(
  customers: ShopifyCustomerRaw[],
  orders: ShopifyOrderRaw[],
  abandonedCheckouts: ShopifyAbandonedCheckoutRaw[]
): {
  customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]
  signals: Omit<CustomerSignal, 'id' | 'customer_id'>[][]
} {
  // Build order map per customer
  const ordersByCustomer: Record<number, ShopifyOrderRaw[]> = {}
  for (const order of orders) {
    const cid = order.customer?.id
    if (!cid) continue
    if (!ordersByCustomer[cid]) ordersByCustomer[cid] = []
    ordersByCustomer[cid].push(order)
  }

  // Build abandoned checkout map by email
  const abandonedByEmail: Record<string, ShopifyAbandonedCheckoutRaw[]> = {}
  for (const checkout of abandonedCheckouts) {
    if (!checkout.email) continue
    if (!abandonedByEmail[checkout.email]) abandonedByEmail[checkout.email] = []
    abandonedByEmail[checkout.email].push(checkout)
  }

  const transformedCustomers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[] = []
  const transformedSignals: Omit<CustomerSignal, 'id' | 'customer_id'>[][] = []

  for (const sc of customers) {
    const customerOrders = ordersByCustomer[sc.id] ?? []
    const customerAbandoned = abandonedByEmail[sc.email] ?? []

    // Sort orders by date descending
    customerOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const lastOrder = customerOrders[0]
    const lastProduct = lastOrder?.line_items?.[0]?.title ?? null
    const totalSpend = parseFloat(sc.total_spent ?? '0')
    const totalOrders = sc.orders_count ?? 0
    const aov = totalOrders > 0 ? totalSpend / totalOrders : 0

    // Check for failed payments
    const failedOrders = customerOrders.filter(
      (o) => o.financial_status === 'pending' || o.financial_status === 'unpaid'
    )

    // Build signals
    const signals: Omit<CustomerSignal, 'id' | 'customer_id'>[] = []

    // Abandoned cart signals
    for (const checkout of customerAbandoned) {
      signals.push({
        signal_type: 'abandoned_cart',
        signal_value: {
          product_name: checkout.line_items?.[0]?.title ?? 'Unknown product',
          cart_value: parseFloat(checkout.total_price ?? '0'),
          checkout_id: checkout.id,
        },
        signal_source: 'shopify',
        recorded_at: checkout.updated_at,
      })
    }

    // Failed payment signals
    for (const order of failedOrders) {
      signals.push({
        signal_type: 'failed_payment',
        signal_value: {
          amount: parseFloat(order.total_price ?? '0'),
          order_id: order.id,
          financial_status: order.financial_status,
        },
        signal_source: 'shopify',
        recorded_at: order.created_at,
      })
    }

    transformedCustomers.push({
      shopify_customer_id: String(sc.id),
      email: sc.email,
      first_name: sc.first_name ?? null,
      last_name: sc.last_name ?? null,
      phone: sc.phone ?? null,
      total_spend: totalSpend,
      total_orders: totalOrders,
      average_order_value: aov,
      last_purchase_at: lastOrder?.created_at ?? null,
      last_product_name: lastProduct,
      klaviyo_profile_id: null,
      email_open_rate: null,
      email_click_rate: null,
      sms_engaged: false,
      tags: sc.tags ? sc.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    })

    transformedSignals.push(signals)
  }

  return { customers: transformedCustomers, signals: transformedSignals }
}

// ─── Full sync function ───────────────────────────────────────────────────────
// Call this from the Shopify integration API route after OAuth completes

export async function syncShopifyStore(
  shopDomain: string,
  accessToken: string
): Promise<{
  customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]
  signals: Omit<CustomerSignal, 'id' | 'customer_id'>[][]
  stats: { customers: number; orders: number; abandoned: number }
}> {
  console.log(`[shopify] Starting sync for ${shopDomain}`)

  const [rawCustomers, rawOrders, rawAbandoned] = await Promise.all([
    fetchShopifyCustomers(shopDomain, accessToken),
    fetchShopifyOrders(shopDomain, accessToken),
    fetchAbandonedCheckouts(shopDomain, accessToken),
  ])

  console.log(`[shopify] Fetched: ${rawCustomers.length} customers, ${rawOrders.length} orders, ${rawAbandoned.length} abandoned`)

  const { customers, signals } = transformShopifyCustomers(
    rawCustomers,
    rawOrders,
    rawAbandoned
  )

  return {
    customers,
    signals,
    stats: {
      customers: rawCustomers.length,
      orders: rawOrders.length,
      abandoned: rawAbandoned.length,
    },
  }
}

// ─── Mock data (Phase 1 demo) ─────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function getMockShopifyData(): {
  customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]
  signals: Omit<CustomerSignal, 'id' | 'customer_id'>[][]
} {
  const customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[] = [
    { shopify_customer_id: 'sh_001', email: 's.chen@email.com', first_name: 'Sarah', last_name: 'Chen', phone: null, total_spend: 847, total_orders: 4, average_order_value: 212, last_purchase_at: daysAgo(89), last_product_name: 'Hydrating Face Serum', klaviyo_profile_id: 'kl_001', email_open_rate: 0.38, email_click_rate: 0.08, sms_engaged: false, tags: ['vip', 'skincare'] },
    { shopify_customer_id: 'sh_002', email: 'james.w@email.com', first_name: 'James', last_name: 'Whitfield', phone: '+14155550102', total_spend: 0, total_orders: 0, average_order_value: 189, last_purchase_at: null, last_product_name: 'Leather Weekend Bag', klaviyo_profile_id: 'kl_002', email_open_rate: 0.12, email_click_rate: 0.02, sms_engaged: false, tags: ['prospect'] },
    { shopify_customer_id: 'sh_003', email: 'p.nair@email.com', first_name: 'Priya', last_name: 'Nair', phone: '+14155550103', total_spend: 952, total_orders: 14, average_order_value: 68, last_purchase_at: daysAgo(3), last_product_name: 'Monthly Subscription Renewal', klaviyo_profile_id: 'kl_003', email_open_rate: 0.68, email_click_rate: 0.22, sms_engaged: true, tags: ['subscriber', 'vip'] },
    { shopify_customer_id: 'sh_004', email: 'aisha.m@email.com', first_name: 'Aisha', last_name: 'Mohammed', phone: null, total_spend: 2840, total_orders: 12, average_order_value: 237, last_purchase_at: daysAgo(71), last_product_name: 'Premium Skincare Bundle', klaviyo_profile_id: 'kl_004', email_open_rate: 0.18, email_click_rate: 0.03, sms_engaged: false, tags: ['vip', 'high-ltv'] },
    { shopify_customer_id: 'sh_005', email: 'marcus.l@email.com', first_name: 'Marcus', last_name: 'Lee', phone: '+14155550105', total_spend: 420, total_orders: 6, average_order_value: 70, last_purchase_at: daysAgo(52), last_product_name: 'Whey Protein 2kg', klaviyo_profile_id: 'kl_005', email_open_rate: 0.44, email_click_rate: 0.09, sms_engaged: true, tags: ['supplements', 'repeat'] },
    { shopify_customer_id: 'sh_006', email: 'emily.t@email.com', first_name: 'Emily', last_name: 'Torres', phone: null, total_spend: 156, total_orders: 2, average_order_value: 78, last_purchase_at: daysAgo(58), last_product_name: 'Daily Vitamin Pack (90-day supply)', klaviyo_profile_id: 'kl_006', email_open_rate: 0.38, email_click_rate: 0.07, sms_engaged: false, tags: ['vitamins'] },
    { shopify_customer_id: 'sh_007', email: 'tobias.k@email.com', first_name: 'Tobias', last_name: 'Klein', phone: null, total_spend: 0, total_orders: 0, average_order_value: 149, last_purchase_at: null, last_product_name: 'Trail Running Shoes', klaviyo_profile_id: 'kl_007', email_open_rate: 0.58, email_click_rate: 0.19, sms_engaged: false, tags: ['prospect', 'high-intent'] },
    { shopify_customer_id: 'sh_008', email: 'chris.p@email.com', first_name: 'Chris', last_name: 'Park', phone: '+14155550108', total_spend: 310, total_orders: 2, average_order_value: 149, last_purchase_at: daysAgo(45), last_product_name: 'Gaming Headset XR', klaviyo_profile_id: 'kl_008', email_open_rate: 0.51, email_click_rate: 0.12, sms_engaged: false, tags: ['electronics'] },
    { shopify_customer_id: 'sh_009', email: 'nina.o@email.com', first_name: 'Nina', last_name: 'Okafor', phone: null, total_spend: 215, total_orders: 2, average_order_value: 107, last_purchase_at: daysAgo(22), last_product_name: 'Linen Throw Blanket', klaviyo_profile_id: 'kl_009', email_open_rate: 0.31, email_click_rate: 0.05, sms_engaged: false, tags: ['homewares'] },
    { shopify_customer_id: 'sh_010', email: 'r.drummond@email.com', first_name: 'Ryan', last_name: 'Drummond', phone: '+14155550110', total_spend: 680, total_orders: 8, average_order_value: 85, last_purchase_at: daysAgo(22), last_product_name: 'Single Origin Coffee Beans 1kg', klaviyo_profile_id: 'kl_010', email_open_rate: 0.72, email_click_rate: 0.28, sms_engaged: true, tags: ['coffee', 'repeat', 'vip'] },
  ]

  const signals: Omit<CustomerSignal, 'id' | 'customer_id'>[][] = [
    [],
    [{ signal_type: 'abandoned_cart', signal_value: { product_name: 'Leather Weekend Bag', cart_value: 189 }, signal_source: 'shopify', recorded_at: daysAgo(1) }],
    [{ signal_type: 'failed_payment', signal_value: { amount: 68, reason: 'card_declined' }, signal_source: 'shopify', recorded_at: daysAgo(3) }],
    [],
    [{ signal_type: 'replenishment_due', signal_value: { product_name: 'Whey Protein 2kg', days_overdue: 7 }, signal_source: 'shopify', recorded_at: daysAgo(2) }],
    [{ signal_type: 'replenishment_due', signal_value: { product_name: 'Daily Vitamin Pack', days_overdue: 3 }, signal_source: 'shopify', recorded_at: daysAgo(1) }],
    [],
    [{ signal_type: 'abandoned_cart', signal_value: { product_name: 'Gaming Headset XR', cart_value: 149 }, signal_source: 'shopify', recorded_at: daysAgo(1) }],
    [],
    [],
  ]

  return { customers, signals }
}
