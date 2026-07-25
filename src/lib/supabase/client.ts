import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when both required env vars are present. Components/hooks that talk
 * to Supabase can check this before making a call, instead of letting a
 * confusing low-level fetch error bubble up.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  // Surfaced once, at startup, in the browser console — not shown to end
  // users, since it's a developer/config problem rather than something a
  // logged-in user caused.
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy .env.example to .env and fill in your project values.',
  );
}

/**
 * Single shared Supabase client for the whole app. Uses the publishable
 * (anon) key only — this file is safe to import from any client component.
 * The service-role key must never be imported here or anywhere in src/.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabasePublishableKey ?? 'placeholder-key',
);
