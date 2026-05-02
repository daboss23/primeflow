-- ─────────────────────────────────────────
-- REVENUE GAP REPORTS
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_reports (
  id                  TEXT PRIMARY KEY,
  email               TEXT,
  store_url           TEXT,
  industry            TEXT,
  monthly_customers   INTEGER,
  aov                 NUMERIC(10,2),
  monthly_revenue     NUMERIC(10,2),
  current_recovery    NUMERIC(10,2) DEFAULT 0,
  total_at_risk       NUMERIC(10,2),
  total_recoverable   NUMERIC(10,2),
  results_json        JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
