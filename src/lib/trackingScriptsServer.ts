/**
 * Server-only tracking scripts fetcher.
 * Used by the root layout to SSR the GTM/Meta Pixel/GA4 snippets directly
 * into the initial HTML — so they are present before any JavaScript runs.
 *
 * Never import this from a 'use client' component — it opens a database connection.
 */
import 'server-only';
import { unstable_cache } from 'next/cache';
import { queryOne } from '@/lib/db';

export interface TrackingScriptsSsr {
  headerScripts: string;
  bodyScripts: string;
  footerScripts: string;
}

/**
 * Fetches header/body/footer tracking scripts from the settings row.
 * Cached for 5 minutes server-side
 * — so the database is queried at most once per 5-minute window across
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
      const data = await queryOne('SELECT header_scripts, body_scripts, footer_scripts FROM settings WHERE id = 1');
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
  { revalidate: 300 }  // 5 minutes
);
