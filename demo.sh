#!/bin/bash
# ─────────────────────────────────────────────────────
# PRIMEFLOW — Revenue Recovery Engine
# Quick demo setup script
# ─────────────────────────────────────────────────────

set -e

echo ""
echo "  PRIMEFLOW — Revenue Recovery Engine"
echo "  Demo Setup"
echo ""

# 1. Check Node
if ! command -v node &> /dev/null; then
  echo "  ✗ Node.js not found. Install Node 18+ from https://nodejs.org"
  exit 1
fi
echo "  ✓ Node $(node -v)"

# 2. Check .env.local
if [ ! -f ".env.local" ]; then
  echo ""
  echo "  ✗ .env.local not found."
  echo "  Copy .env.example → .env.local and fill in:"
  echo ""
  echo "    NEXT_PUBLIC_SUPABASE_URL=..."
  echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
  echo "    SUPABASE_SERVICE_ROLE_KEY=..."
  echo "    ANTHROPIC_API_KEY=..."
  echo "    NEXT_PUBLIC_APP_URL=http://localhost:3000"
  echo ""
  exit 1
fi
echo "  ✓ .env.local found"

# 3. Install dependencies
echo ""
echo "  Installing dependencies..."
npm install --silent
echo "  ✓ Dependencies installed"

# 4. Start dev server
echo ""
echo "  Starting PRIMEFLOW..."
echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │  Open: http://localhost:3000                 │"
echo "  │                                              │"
echo "  │  1. Click 'Load Demo Data →' on dashboard   │"
echo "  │  2. Browse Customers → filter by Red        │"
echo "  │  3. Click a customer → Generate a Draft     │"
echo "  │  4. Approve → check Analytics               │"
echo "  └─────────────────────────────────────────────┘"
echo ""

npm run dev
