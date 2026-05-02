# PRIMEFLOW — Revenue Recovery Engine

AI-powered ecommerce customer health & reactivation engine for Shopify brands.

---

## Run the Demo Locally — 5 Steps

### Prerequisites
- Node.js 18+ (`node -v` to check)
- A Supabase project (free tier works: https://supabase.com)
- An Anthropic API key (https://console.anthropic.com)

### Step 1 — Install

```bash
npm install
```

### Step 2 — Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Where to find these:**
> - Supabase: Project Settings → API → URL + anon key + service_role key
> - Anthropic: console.anthropic.com → API Keys

### Step 3 — Run database schema

In your Supabase dashboard → SQL Editor → paste and run the contents of:

```
supabase/schema.sql
```

This creates all 6 tables + indexes + the `current_customer_health` view.

### Step 4 — Start the app

```bash
npm run dev
# or: bash demo.sh
```

Open: **http://localhost:3000**

### Step 5 — Load demo data

1. Click **"Load Demo Data →"** on the dashboard
2. The engine seeds 10 realistic customers and runs scoring automatically
3. You'll see the dashboard populate with health stats

---

## Demo Walkthrough

```
Dashboard
  → See: health distribution, state breakdown, at-risk revenue
  → Red = 4 customers needing immediate action

Customers (/customers)
  → Filter: Red band → sorted by opportunity score
  → Click: Aisha Mohammed (VIP at Risk, $2,840 LTV)
  → See: health score, reason code, suggested action

Customer Detail
  → Click "Generate Email Draft"
  → Claude writes a real personalised email (server-side, ~3s)
  → Review draft → click "Approve & Queue"

Analytics (/analytics)
  → See: drafts generated, approved, outreach by channel
  → As you approve more drafts, metrics update
```

---

## What the Logo Does

The **Revenue Recovery Engine** logo appears in:
- Sidebar header (162px, always visible)
- Dashboard header (220px, with "Revenue Recovery Engine" label)
- Empty state (180px, subtle opacity)

The **pulse animation** runs on the central signal/heartbeat ring:
- Two layered CSS radial glows positioned over the emblem
- Inner ring: cyan (#00d4ff), 3.2s breath cycle, peaks when outer fades
- Outer ring: violet, offset phase — creates a layered "living signal" effect
- Uses `mix-blend-mode: screen` so the PNG white background disappears on dark surfaces
- Animation is CSS-only, no JS, no layout impact

---

## Architecture

See `ARCHITECTURE.md` for full details.

### Key files

| File | Purpose |
|------|---------|
| `src/lib/scoring.ts` | Rules-based health + opportunity engine |
| `src/lib/ai.ts` | Server-side AI draft generation only |
| `src/services/shopify.ts` | Shopify connector (mock Phase 1) |
| `src/services/klaviyo.ts` | Klaviyo connector (stub Phase 1) |
| `src/components/ui/LogoPulse.tsx` | Animated logo component |
| `src/app/api/draft/route.ts` | Draft generation endpoint |
| `src/app/api/score/route.ts` | Scoring trigger |
| `supabase/schema.sql` | Full DB schema |

---

## Phase 2 Checklist

- [ ] Shopify OAuth flow (`/api/integrations/shopify`)
- [ ] Real Shopify customer/order sync (`services/shopify.ts`)
- [ ] Klaviyo profile + event sync (`services/klaviyo.ts`)
- [ ] Supabase Auth (store-level login)
- [ ] Background scoring jobs (Inngest or pg_cron)
- [ ] Actual email/SMS send (Klaviyo or SendGrid)
- [ ] Outcome webhook receivers (Shopify order webhook)

