# PRIMEFLOW — Architecture & Implementation Plan

## Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (server-only AI calls)
- **Database**: Supabase (Postgres)
- **AI**: Anthropic Claude — server-side only, never client-exposed
- **Integrations**: Shopify Admin API, Klaviyo API (stubbed for Phase 1, structured for real integration)

---

## Assumptions (MVP decisions)
1. **Single-tenant for v1** — no multi-org auth. One shop per deployment. Add Supabase Auth in Phase 2.
2. **No background job runner** — scoring triggers on-demand via API. Phase 2 adds cron/queue (e.g. Inngest or Supabase pg_cron).
3. **Shopify + Klaviyo are stubbed** — real connector structure is in place, returning mock data until OAuth is wired.
4. **No send integration yet** — "Approve & Queue" stores the draft as `status: queued`. Actual send (via Klaviyo or SendGrid) is Phase 2.
5. **Rules-based scoring** — no ML. Clean, auditable, explainable logic. Upgrade to ML signals in Phase 3.
6. **No rate limiting on API routes** — add in Phase 2 before exposing to real customers.

---

## Folder Structure

```
primeflow/
├── supabase/
│   └── schema.sql              # Full DB schema + seed
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout, dark theme
│   │   ├── page.tsx             # Dashboard
│   │   ├── globals.css
│   │   ├── customers/
│   │   │   ├── page.tsx         # Customer list view
│   │   │   └── [id]/page.tsx    # Customer detail view
│   │   ├── analytics/
│   │   │   └── page.tsx         # Analytics panel
│   │   └── api/
│   │       ├── customers/route.ts
│   │       ├── score/route.ts       # Run scoring engine
│   │       ├── draft/route.ts       # Generate AI draft (server-only)
│   │       ├── outcomes/route.ts    # Track outcomes
│   │       ├── analytics/route.ts   # Analytics aggregates
│   │       ├── seed/route.ts        # Dev: seed mock data
│   │       └── integrations/
│   │           ├── shopify/route.ts
│   │           └── klaviyo/route.ts
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client (server + browser)
│   │   ├── scoring.ts           # Rules-based health + opportunity engine
│   │   ├── ai.ts                # AI draft generation (server-only)
│   │   └── utils.ts             # Shared helpers
│   ├── services/
│   │   ├── shopify.ts           # Shopify Admin API client (stubbed)
│   │   └── klaviyo.ts           # Klaviyo API client (stubbed)
│   ├── types/
│   │   └── index.ts             # All shared TypeScript types
│   └── components/
│       ├── ui/                  # Primitives: Badge, Card, Button, etc.
│       ├── layout/              # Sidebar, Header
│       ├── dashboard/           # HealthOverview, RecentActivity
│       ├── customers/           # CustomerList, CustomerRow, CustomerDetail
│       ├── drafts/              # MessagePanel
│       └── analytics/           # Charts, AnalyticsPanel
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Database Schema

### customers
Core customer identity + Shopify-synced purchase data.

### customer_signals
Raw behavioral signals ingested from Shopify or Klaviyo (events).

### customer_health
The computed output of the scoring engine per customer per run.

### outreach_drafts
AI-generated message drafts with status tracking through the review workflow.

### outcomes
What happened after outreach: reply, purchase, no action, unsubscribed.

### integrations
Per-shop connector config and connection status.

---

## Operator Loop (Core)

```
Ingest (Shopify + Klaviyo)
    ↓
Score (rules engine → health_score, opp_score, state, reason)
    ↓
List (red → yellow → green, sorted by opportunity)
    ↓
Detail (customer context + reason code + suggested action)
    ↓
Draft (server-side AI call → email or SMS)
    ↓
Review (approve / skip / regenerate / escalate)
    ↓
Track (outcome recorded → analytics updated)
```

---

## Implementation Build Order

### Phase 1 (this build)
1. DB schema + seed data
2. Types
3. Scoring engine
4. API routes (customers, score, draft, outcomes, analytics)
5. Shopify + Klaviyo service stubs
6. Layout + navigation
7. Dashboard page
8. Customer list page
9. Customer detail + message panel
10. Analytics page

### Phase 2
- Supabase Auth (store-level login)
- Real Shopify OAuth flow
- Real Klaviyo OAuth flow
- Background scoring jobs (Inngest or pg_cron)
- Actual send via Klaviyo or SendGrid

### Phase 3
- Signal enrichment (ML scoring layer)
- Multi-store support
- Outcome loop feedback
- A/B draft testing
