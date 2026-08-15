import { HeroBanner } from '@/types';

/**
 * Client-side hero banner fetch/cache — replaces the old firestoreBanners.ts.
 * That file's `/api/admin/banners` call (real Supabase data) was raced
 * against a 2s timeout with a Firestore fallback; the Firestore side has
 * been dead since the Supabase migration, so any time the real fetch took
 * >2s (routine, since banner images can be several hundred KB) the homepage
 * silently fell back to these placeholder banners instead. No more race —
 * just fetch and wait for it, same pattern as PromoBar/TrackingScripts.
 */

const LOCAL_STORAGE_KEY = 'lumiflick_hero_banners_v1';

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    image: '/logo.png',
    title: 'Transform Your Empty Walls Into Living Art',
    subtitle: 'Handcrafted luxury canvas & textured wooden frames tailored for modern homes.',
    link: '/product-category/best-selling',
    buttonText: 'Shop Best Sellers',
    badge: 'Premium Collection',
    order: 1,
    isActive: true,
  },
  {
    id: 'banner-2',
    image: '/logo.png',
    title: 'Porsche & Supercars Enthusiast Series',
    subtitle: 'High-octane automotive wall prints in museum quality matte finish.',
    link: '/product-category/cars-frame-collection',
    buttonText: 'Explore Cars Series',
    badge: 'Automotive Art',
    order: 2,
    isActive: true,
  },
  {
    id: 'banner-3',
    image: '/logo.png',
    title: 'Sacred Calligraphy & Spiritual Elegance',
    subtitle: 'Ayat-ul-Kursi and 4 Quls masterworks with golden accent foil effects.',
    link: '/product-category/religious-luxury-frame',
    buttonText: 'View Religious Frames',
    badge: 'Islamic Art',
    order: 3,
    isActive: true,
  },
  {
    id: 'banner-4',
    image: '/logo.png',
    title: '5 Frames Signature Gallery Sets',
    subtitle: 'Complete room transformation bundles for master bedrooms and living rooms.',
    link: '/product-category/5-frames-set',
    buttonText: 'Discover 5-Frame Sets',
    badge: 'Gallery Sets',
    order: 4,
    isActive: true,
  },
];

export function getCachedHeroBanners(): HeroBanner[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

/** Fetch live banners from Supabase (via the admin API's public GET) and cache them. */
export async function fetchHeroBanners(): Promise<HeroBanner[]> {
  try {
    const res = await fetch('/api/admin/banners');
    const data = await res.json();
    if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
      const list = [...data.banners].sort((a: HeroBanner, b: HeroBanner) => (a.order || 0) - (b.order || 0));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        } catch {
          // ignore quota errors
        }
      }
      return list;
    }
  } catch (err) {
    console.warn('Failed to fetch hero banners:', err);
  }
  return getCachedHeroBanners() || DEFAULT_HERO_BANNERS;
}

/** Broadcast a fresh banner list to any mounted HeroSlider (same pattern as lumiflick_settings_updated). */
export function broadcastHeroBanners(list: HeroBanner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
  window.dispatchEvent(new CustomEvent('lumiflick_banners_updated', { detail: list }));
}
