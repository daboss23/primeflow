/**
 * Klaviyo API service.
 *
 * Phase 1: Engagement data is baked into the mock customer records from Shopify.
 * Phase 2: Replace with real Klaviyo API v2023-10+ calls.
 *
 * Real API endpoints to implement in Phase 2:
 * - GET /api/profiles — fetch all profiles
 * - GET /api/events — fetch email/SMS events per profile
 * - GET /api/metrics — open/click rates per campaign or flow
 */

import type { KlaviyoProfile } from '@/types'

const KLAVIYO_BASE = 'https://a.klaviyo.com/api'
const API_VERSION = '2024-10-15'

// ─── Real API client (Phase 2) ─────────────────────────────────────────────

export async function fetchKlaviyoProfiles(
  apiKey: string
): Promise<KlaviyoProfile[]> {
  // Phase 2:
  // const res = await fetch(`${KLAVIYO_BASE}/profiles/`, {
  //   headers: {
  //     Authorization: `Klaviyo-API-Key ${apiKey}`,
  //     revision: API_VERSION,
  //   },
  // })
  // const data = await res.json()
  // return data.data.map(transformKlaviyoProfile)

  return [] // Phase 1: data already in mock customers
}

export async function fetchProfileEngagement(
  _apiKey: string,
  _profileId: string
): Promise<{ open_rate: number; click_rate: number; sms_consent: boolean }> {
  // Phase 2: fetch from Klaviyo Events API
  return { open_rate: 0, click_rate: 0, sms_consent: false }
}

// ─── Phase 2: Send via Klaviyo ────────────────────────────────────────────

export async function sendEmailViaKlaviyo(
  _apiKey: string,
  _profileId: string,
  _subject: string,
  _body: string
): Promise<{ sent: boolean; message_id?: string }> {
  // Phase 2: Use Klaviyo track endpoint or create a one-off send
  // This requires a transactional email template setup
  return { sent: false }
}

export async function sendSmsViaKlaviyo(
  _apiKey: string,
  _profileId: string,
  _body: string
): Promise<{ sent: boolean; message_id?: string }> {
  // Phase 2: Klaviyo SMS send
  return { sent: false }
}
