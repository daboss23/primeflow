import { createClient } from '@supabase/supabase-js'

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? ''
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY    ?? ''

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

// Browser client — safe for client components, respects RLS
export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any)

// Server client — bypasses RLS, use only in API routes / server components
export const supabaseAdmin = hasSupabase
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : (null as any)
