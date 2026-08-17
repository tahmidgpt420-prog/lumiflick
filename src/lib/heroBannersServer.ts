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
 * Returns both mobile and desktop image URLs for the first active banner —
 * used to build two <link rel="preload" media="..."> tags in the <head>,
 * matching HeroSlider's own isMobile breakpoint (window.innerWidth < 640).
 *
 * A single unconditional preload used to exist here at the mobile (800px)
 * size only. On desktop, HeroSlider requested a different URL (previously
 * Drive's unbounded 'original', now capped at 1920px) — so the preload
 * never matched what the browser actually needed for the LCP element, and
 * Chrome couldn't credit it (Lighthouse flagged this: "fetchpriority=high
 * should be applied to the image preload request" = false). Two
 * media-gated preloads mean exactly one loads per visitor, and it always
 * matches the real <img src>.
 */
export function getFirstBannerPreloadUrls(
  banners: HeroBanner[]
): { mobile: string; desktop: string } | null {
  if (!banners || banners.length === 0) return null;
  const first = banners[0];
  if (!first.image) return null;
  return {
    mobile: formatImageUrl(first.image, 800),
    desktop: formatImageUrl(first.image, 1920),
  };
}
