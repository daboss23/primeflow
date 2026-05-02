import Anthropic from '@anthropic-ai/sdk'
import type { Customer, CustomerHealth, DraftChannel } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const PROMPT_VERSION = 'v3'

export interface BrandSettings {
  brand_name?: string | null
  brand_tone?: string | null
  brand_voice_description?: string | null
  brand_signoff?: string | null
  brand_avoid?: string | null
  brand_example_good?: string | null
  brand_example_bad?: string | null
  brand_industry?: string | null
}

// ─── State-specific copywriting prompts ───────────────────────────────────────
// Each state has a different customer psychology and requires a different approach.
// These are battle-tested direct response frameworks for each scenario.

const STATE_PROMPTS: Record<string, string> = {
  abandoned_cart: `
CUSTOMER STATE: Abandoned Cart
PSYCHOLOGY: This person showed direct purchase intent. They wanted it. Something stopped them — distraction, doubt, price hesitation, or just life getting in the way. They are warm. The window is short.
COPYWRITING APPROACH:
- Reference the specific product they left behind
- Create gentle urgency without fake scarcity ("still available" not "only 2 left!")
- Remove friction — give them a direct path back
- Use social proof if relevant (others love this product)
- Keep it short — one clear CTA back to their cart
- Do NOT offer a discount unless brand rules allow it
- Tone: warm, direct, helpful — like a friend who noticed they forgot something
WHAT NEVER WORKS: Generic "you left something behind" with no product reference. Aggressive countdown timers. Multiple CTAs.`,

  failed_payment: `
CUSTOMER STATE: Failed Payment
PSYCHOLOGY: This person tried to buy or renew. The failure was technical, not intentional. They are not a lost customer — they are a stuck customer. They may not even know the payment failed. Urgency is real but tone must be helpful not alarming.
COPYWRITING APPROACH:
- Lead with helpfulness, not alarm
- Be specific about what failed if known (renewal, order, subscription)
- Make the fix dead simple — one tap, one link
- For high-LTV customers, elevate the tone significantly
- For subscribers, acknowledge their loyalty
- Urgency is appropriate here — access or order is genuinely at risk
- Tone: calm, helpful, practical — like a trusted brand that has their back
WHAT NEVER WORKS: Alarming subject lines. Blame. Complicated instructions. Cold transactional language.`,

  dormant_buyer: `
CUSTOMER STATE: Dormant Buyer
PSYCHOLOGY: This person bought before. They had a good enough experience to purchase. Then life moved on. They haven't forgotten the brand — they've just drifted. The goal is a warm re-entry, not a hard sell. They need a reason to remember why they liked this brand.
COPYWRITING APPROACH:
- Reference their last purchase specifically — show you remember them
- No pressure, no guilt, no "we miss you" clichés
- Give them something new to be curious about — new product, new formula, seasonal angle
- Or simply remind them of something they loved
- Make the re-entry feel natural, not desperate
- Tone: warm, personal, low pressure — like catching up with someone you haven't seen in a while
WHAT NEVER WORKS: "We miss you" subject lines. Guilt. Aggressive discounting as the first move. Generic catalogue email dressed up as personal.`,

  repeat_at_risk: `
CUSTOMER STATE: Repeat Buyer at Risk / VIP Going Quiet
PSYCHOLOGY: This is your most valuable customer type. They have a history with the brand. Multiple purchases. Real loyalty. And now something has shifted — engagement fading, purchase cadence breaking. This requires the most elevated, personal approach of any state. They deserve more than an automated email.
COPYWRITING APPROACH:
- Acknowledge their history without being sycophantic
- Elevated, personal tone — this is not a mass email
- For very high LTV customers, consider a direct personal check-in from a founder or team member
- Reference their specific purchase history where possible
- Offer something meaningful — early access, personal recommendation, genuine care
- This is not the place for discounts as a first move — it cheapens the relationship
- Tone: premium, personal, genuine — like a brand that actually notices and values them
WHAT NEVER WORKS: Generic win-back copy sent to VIPs. Discount as the opening move. Anything that feels automated or mass-produced.`,

  replenishment: `
CUSTOMER STATE: Replenishment Opportunity
PSYCHOLOGY: This person bought a consumable product and is likely running low or has already run out. The timing is everything. Hit this window right and conversion is near-certain because they already want what you sell. Miss it and they go elsewhere or forget.
COPYWRITING APPROACH:
- Lead with the specific product and timing ("running low on your X?")
- Make reordering completely frictionless — one tap
- Acknowledge their purchase cadence if relevant ("you usually reorder around now")
- Optional: mention any new variants, bundles, or subscription savings
- Keep it short — this customer doesn't need convincing, they need convenience
- Tone: helpful, timely, convenient — like a brand that pays attention
WHAT NEVER WORKS: Long emails. Multiple products. Anything that adds friction to what should be a simple reorder.`,

  engaged_unconverted: `
CUSTOMER STATE: Engaged But Never Converted
PSYCHOLOGY: This person is interested. They open emails, click links, browse products. Something is stopping the first purchase — price hesitation, comparison shopping, decision paralysis, trust gap, or just needing the right nudge at the right moment. The intent is there. The job is to remove the barrier.
COPYWRITING APPROACH:
- Acknowledge their interest without being creepy about it
- Address the most likely friction point for your category (quality? price? fit? ingredients?)
- Social proof is powerful here — reviews, results, community
- Make the first purchase feel low-risk — easy returns, guarantee, starter size
- One product, one CTA — don't overwhelm someone already in decision mode
- Tone: reassuring, confident, helpful — like a knowledgeable friend removing doubt
WHAT NEVER WORKS: Sending a catalogue to someone who can't decide. Hard sell. Ignoring the obvious hesitation.`,

  healthy: `
CUSTOMER STATE: Healthy / Active
PSYCHOLOGY: This customer is in a good place. No intervention needed. If messaging is appropriate, it should feel like a reward for their loyalty, not a recovery attempt.
COPYWRITING APPROACH:
- Keep it light and positive
- Loyalty recognition, early access, or a simple thank you
- No urgency, no alarm, no recovery framing
- Tone: appreciative, warm, brand-affirming`,
}

// ─── Build system prompt ──────────────────────────────────────────────────────
function buildSystemPrompt(brand: BrandSettings, state: string): string {
  const name = brand.brand_name ?? 'this brand'
  const industry = brand.brand_industry ? ` in the ${brand.brand_industry} space` : ''

  const toneMap: Record<string, string> = {
    casual:       'friendly, warm, and conversational — like a knowledgeable friend',
    professional: 'clear, confident, and professional — respectful without being stiff',
    luxury:       'elevated, refined, and exclusive — never pushy, always tasteful',
    bold:         'direct, punchy, and energetic — short sentences, strong verbs, no fluff',
    playful:      'fun, light, and human — personality without sacrificing clarity',
    empathetic:   'warm, understanding, and genuinely helpful — customer first in every sentence',
  }

  const toneDescription = toneMap[brand.brand_tone ?? 'professional'] ?? toneMap.professional
  const statePrompt = STATE_PROMPTS[state] ?? STATE_PROMPTS.healthy

  let prompt = `You are an expert ecommerce retention copywriter. You write one-to-one recovery messages for ${name}${industry}.

BRAND TONE: ${toneDescription}
`

  if (brand.brand_voice_description) {
    prompt += `\nBRAND VOICE: ${brand.brand_voice_description}`
  }

  if (brand.brand_signoff) {
    prompt += `\nSIGN OFF: Always end with "${brand.brand_signoff}"`
  }

  if (brand.brand_avoid) {
    prompt += `\nNEVER USE: ${brand.brand_avoid}`
  }

  // State-specific copywriting framework
  prompt += `\n\n${statePrompt}`

  // Few-shot examples
  if (brand.brand_example_good) {
    prompt += `\n\nEXACT TONE EXAMPLE — write like this:\n"${brand.brand_example_good}"`
  }

  if (brand.brand_example_bad) {
    prompt += `\n\nNEVER write like this:\n"${brand.brand_example_bad}"`
  }

  // Universal rules
  prompt += `

UNIVERSAL RULES — always apply:
- Write like a real human, not a marketing bot
- Be specific — reference the customer's actual purchase history and signals
- No fake intimacy ("Hope this finds you well", "As a valued customer", "We miss you")
- No fake urgency unless the situation genuinely calls for it
- Email body under 130 words
- SMS under 155 characters
- One clear call to action — never two
- Never use ALL CAPS for emphasis
- No hashtags or emojis in email
- One subtle emoji maximum in SMS if it fits the brand tone`

  return prompt
}

// ─── Build customer prompt ────────────────────────────────────────────────────
function buildCustomerPrompt(
  customer: Customer,
  health: CustomerHealth,
  channel: DraftChannel
): string {
  const daysSince = customer.last_purchase_at
    ? Math.floor((Date.now() - new Date(customer.last_purchase_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isVip = customer.total_spend >= 500
  const isHighAov = customer.average_order_value >= 150

  const context = `
CUSTOMER PROFILE:
- Name: ${customer.first_name ?? 'Customer'} ${customer.last_name ?? ''}
- Total orders: ${customer.total_orders}
- Total lifetime spend: $${customer.total_spend.toFixed(2)}${isVip ? ' (VIP)' : ''}
- Average order value: $${customer.average_order_value.toFixed(2)}${isHighAov ? ' (high value)' : ''}
- Last purchase: ${daysSince !== null ? `${daysSince} days ago` : 'Never purchased'}
- Last product: ${customer.last_product_name ?? 'Unknown'}
- Email open rate: ${customer.email_open_rate !== null ? Math.round((customer.email_open_rate ?? 0) * 100) + '%' : 'Unknown'}
- SMS engaged: ${customer.sms_engaged ? 'Yes' : 'No'}

INTELLIGENCE:
- State: ${health.state}
- Health score: ${health.health_score}/100
- Opportunity score: ${health.opportunity_score}/100
- Why they were flagged: ${health.reason_code}
- Recommended action: ${health.suggested_action}
`.trim()

  if (channel === 'email') {
    return `${context}

TASK: Write a personalised retention email for this specific customer using the copywriting framework above.

Format exactly as:
Subject: [subject line — specific, not generic, under 50 characters]

[email body — under 130 words, one CTA at the end, sign off as instructed]`
  }

  return `${context}

TASK: Write a personalised SMS for this specific customer using the copywriting framework above.
Under 155 characters. Direct, personal, one clear action. Write ONLY the SMS text — nothing else.`
}

// ─── Parse email ──────────────────────────────────────────────────────────────
function parseEmailDraft(raw: string): { subject: string | null; body: string } {
  const lines = raw.trim().split('\n')
  const subjectLine = lines.find((l) => l.toLowerCase().startsWith('subject:'))
  const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : null
  const bodyStart = subjectLine ? lines.indexOf(subjectLine) + 1 : 0
  const body = lines.slice(bodyStart).join('\n').trim().replace(/^\n+/, '')
  return { subject, body }
}

// ─── Main generate function ───────────────────────────────────────────────────
export async function generateDraft(
  customer: Customer,
  health: CustomerHealth,
  channel: DraftChannel,
  brand: BrandSettings = {}
): Promise<{ draft_text: string; subject_line: string | null; prompt_version: string }> {
  const systemPrompt = buildSystemPrompt(brand, health.state)
  const userPrompt = buildCustomerPrompt(customer, health, channel)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')
    .trim()

  if (channel === 'email') {
    const { subject, body } = parseEmailDraft(raw)
    return { draft_text: body, subject_line: subject, prompt_version: PROMPT_VERSION }
  }

  return { draft_text: raw, subject_line: null, prompt_version: PROMPT_VERSION }
}
