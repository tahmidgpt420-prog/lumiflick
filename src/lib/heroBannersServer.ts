/**
 * Server-only hero banner fetcher.
 * Used by the root layout to SSR the first banner and inject a <link rel="preload">
 * so the browser can start downloading the LCP image before JS runs.
 *
 * Never import this from a 'use client' component — it uses the service_role key.
 */
import 'server-only';
import { supabaseAdmin } from '@/lib/supabase';
import { bannerFromDb } from '@/lib/supabaseMappers';
import { HeroBanner } from '@/types';
import { formatImageUrl } from '@/utils/driveUrl';

/**
 * Fetches active banners ordered by display_order.
 * Returns [] on error so the page still renders with the client-side fallback.
 */
export async function getHeroBannersServer(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('display_order');
    if (error) throw error;
    const all: HeroBanner[] = (data || []).map(bannerFromDb);
    return all.filter((b) => b.isActive !== false);
  } catch (err) {
    console.warn('[SSR] Failed to fetch hero banners:', err);
    return [];
  }
}

/**
 * Returns the direct image URL for the first active banner (mobile size).
 * Used to build the <link rel="preload"> tag in the <head>.
 */
export function getFirstBannerPreloadUrl(banners: HeroBanner[]): string | null {
  if (!banners || banners.length === 0) return null;
  const first = banners[0];
  if (!first.image) return null;
  // Use 800px width for mobile preload — matches the formatImageUrl call in HeroSlider
  return formatImageUrl(first.image, 800);
}
