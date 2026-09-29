/**
 * Server-only hero banner fetcher.
 * Used by the root layout to SSR the first banner and inject a <link rel="preload">
 * so the browser can start downloading the LCP image before JS runs.
 *
 * Never import this from a 'use client' component — it opens a database connection.
 */
import 'server-only';
import { query } from '@/lib/db';
import { bannerFromDb } from '@/lib/dbMappers';
import { HeroBanner } from '@/types';

/**
 * Fetches active banners ordered by display_order.
 * Returns [] on error so the page still renders with the client-side fallback.
 */
export async function getHeroBannersServer(): Promise<HeroBanner[]> {
  try {
    const rows = await query('SELECT * FROM banners ORDER BY display_order IS NULL, display_order');
    const all: HeroBanner[] = rows.map(bannerFromDb);
    return all.filter((b) => b.isActive !== false);
  } catch (err) {
    console.warn('[SSR] Failed to fetch hero banners:', err);
    return [];
  }
}
