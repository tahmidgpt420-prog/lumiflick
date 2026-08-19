/**
 * Server-only tracking scripts fetcher.
 * Used by the root layout to SSR the GTM/Meta Pixel/GA4 snippets directly
 * into the initial HTML — so they are present before any JavaScript runs.
 *
 * Never import this from a 'use client' component — it uses the service_role key.
 */
import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export interface TrackingScriptsSsr {
  headerScripts: string;
  bodyScripts: string;
  footerScripts: string;
}

/**
 * Fetches header/body/footer tracking scripts from the settings row.
 * Cached for 5 minutes server-side (same TTL as /api/store-settings CDN
 * cache) — so Supabase is queried at most once per 5-minute window across
 * all page loads, not on every individual request.
 * Returns empty strings on any error so the page still renders normally.
 */
export const getTrackingScriptsServer = unstable_cache(
  async (): Promise<TrackingScriptsSsr> => {
    const empty: TrackingScriptsSsr = {
      headerScripts: '',
      bodyScripts: '',
      footerScripts: '',
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('header_scripts, body_scripts, footer_scripts')
        .eq('id', 1)
        .single();

      if (error) throw error;
      if (!data) return empty;

      return {
        headerScripts: data.header_scripts ?? '',
        bodyScripts: data.body_scripts ?? '',
        footerScripts: data.footer_scripts ?? '',
      };
    } catch (err) {
      console.warn('[SSR] Failed to fetch tracking scripts:', err);
      return empty;
    }
  },
  ['tracking-scripts'], // cache key
  { revalidate: 300 }  // 5 minutes — matches /api/store-settings s-maxage
);
