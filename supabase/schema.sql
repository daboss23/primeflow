-- PRIMEFLOW — Supabase / Postgres Schema
-- Run this in your Supabase SQL editor or via psql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- INTEGRATIONS
-- ─────────────────────────────────────────
CREATE TABLE integrations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain         TEXT NOT NULL UNIQUE,
  shopify_connected   BOOLEAN NOT NULL DEFAULT false,
  klaviyo_connected   BOOLEAN NOT NULL DEFAULT false,
  shopify_token       TEXT,
  klaviyo_api_key     TEXT,
  config_json         JSONB DEFAULT '{}',
  last_synced_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────
CREATE TABLE customers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopify_customer_id   TEXT UNIQUE,
  email                 TEXT NOT NULL,
  first_name            TEXT,
  last_name             TEXT,
  phone                 TEXT,
  total_spend           NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_orders          INTEGER NOT NULL DEFAULT 0,
  average_order_value   NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_purchase_at      TIMESTAMPTZ,
  last_product_name     TEXT,
  klaviyo_profile_id    TEXT,
  email_open_rate       NUMERIC(5,2),
  email_click_rate      NUMERIC(5,2),
  sms_engaged           BOOLEAN DEFAULT false,
  tags                  TEXT[],
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_shopify_id ON customers(shopify_customer_id);
CREATE INDEX idx_customers_last_purchase ON customers(last_purchase_at DESC);

-- ─────────────────────────────────────────
-- CUSTOMER SIGNALS
-- Raw behavioral events from Shopify / Klaviyo
-- ─────────────────────────────────────────
CREATE TABLE customer_signals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  signal_type   TEXT NOT NULL,
  -- e.g. abandoned_cart, failed_payment, email_open, email_click,
  --      sms_reply, order_placed, subscription_renewed, page_view
  signal_value  JSONB DEFAULT '{}',
  signal_source TEXT NOT NULL,
  -- e.g. shopify, klaviyo, manual
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signals_customer ON customer_signals(customer_id);
CREATE INDEX idx_signals_type ON customer_signals(signal_type);
CREATE INDEX idx_signals_recorded ON customer_signals(recorded_at DESC);

-- ─────────────────────────────────────────
-- CUSTOMER HEALTH
-- Output of scoring engine per run
-- ─────────────────────────────────────────
CREATE TYPE health_band AS ENUM ('red', 'yellow', 'green');

CREATE TYPE customer_state AS ENUM (
  'abandoned_cart',
  'failed_payment',
  'dormant_buyer',
  'repeat_at_risk',
  'replenishment',
  'engaged_unconverted',
  'healthy'
);

CREATE TABLE customer_health (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  health_score      INTEGER NOT NULL CHECK (health_score BETWEEN 0 AND 100),
  opportunity_score INTEGER NOT NULL CHECK (opportunity_score BETWEEN 0 AND 100),
  state             customer_state NOT NULL,
  health_band       health_band NOT NULL,
  reason_code       TEXT NOT NULL,
  suggested_action  TEXT NOT NULL,
  signals_used      JSONB DEFAULT '[]',
  scored_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only keep latest score per customer (use view for current)
CREATE INDEX idx_health_customer ON customer_health(customer_id);
CREATE INDEX idx_health_band ON customer_health(health_band);
CREATE INDEX idx_health_scored ON customer_health(scored_at DESC);

-- Convenience view: latest health per customer
CREATE OR REPLACE VIEW current_customer_health AS
SELECT DISTINCT ON (customer_id)
  ch.*,
  c.email,
  c.first_name,
  c.last_name,
  c.total_spend,
  c.total_orders,
  c.average_order_value,
  c.last_purchase_at,
  c.last_product_name,
  c.email_open_rate,
  c.email_click_rate
FROM customer_health ch
JOIN customers c ON c.id = ch.customer_id
ORDER BY customer_id, scored_at DESC;

-- ─────────────────────────────────────────
-- OUTREACH DRAFTS
-- ─────────────────────────────────────────
CREATE TYPE draft_channel AS ENUM ('email', 'sms');

CREATE TYPE draft_status AS ENUM (
  'generated',
  'approved',
  'queued',
  'sent',
  'skipped',
  'escalated'
);

CREATE TABLE outreach_drafts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  health_id       UUID REFERENCES customer_health(id),
  channel         draft_channel NOT NULL,
  draft_text      TEXT NOT NULL,
  subject_line    TEXT,
  -- email only
  prompt_version  TEXT NOT NULL DEFAULT 'v1',
  status          draft_status NOT NULL DEFAULT 'generated',
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at     TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  approved_by     TEXT
  -- for Phase 2: FK to users table
);

CREATE INDEX idx_drafts_customer ON outreach_drafts(customer_id);
CREATE INDEX idx_drafts_status ON outreach_drafts(status);
CREATE INDEX idx_drafts_generated ON outreach_drafts(generated_at DESC);

-- ─────────────────────────────────────────
-- OUTCOMES
-- ─────────────────────────────────────────
CREATE TYPE outcome_type AS ENUM (
  'replied',
  'purchased',
  'no_action',
  'unsubscribed',
  'escalated',
  'bounced'
);

CREATE TABLE outcomes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  draft_id        UUID REFERENCES outreach_drafts(id),
  outcome_type    outcome_type NOT NULL,
  revenue_value   NUMERIC(10,2) DEFAULT 0,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  source          TEXT DEFAULT 'manual'
  -- 'manual' | 'shopify_webhook' | 'klaviyo_webhook'
);

CREATE INDEX idx_outcomes_customer ON outcomes(customer_id);
CREATE INDEX idx_outcomes_draft ON outcomes(draft_id);
CREATE INDEX idx_outcomes_type ON outcomes(outcome_type);
CREATE INDEX idx_outcomes_occurred ON outcomes(occurred_at DESC);
