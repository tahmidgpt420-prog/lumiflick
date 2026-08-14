import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

/**
 * Public client — safe to use in the browser (RLS restricts it to
 * SELECT-only on catalog tables, nothing on orders). Uses the
 * publishable/anon key, which is meant to be public.
 */
export const supabasePublic = createClient(
  SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/**
 * Server-only client — bypasses RLS entirely via the service_role key.
 * Every admin write goes through this. Never import this file's
 * `supabaseAdmin` export from a 'use client' component; the service_role
 * key must never reach the browser.
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);
