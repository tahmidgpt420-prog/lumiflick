import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { HeroBanner } from '@/types';

const BANNERS_COL = 'hero_banners';
const DELETED_BANNERS_COL = 'deleted_hero_banners';
const LOCAL_STORAGE_KEY = 'lumiflick_hero_banners_v1';

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130840.png',
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
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130838.png',
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
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130839.png',
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
    image: 'https://genuinetask.com.bd/wp-content/uploads/2026/06/130837.png',
    title: '5 Frames Signature Gallery Sets',
    subtitle: 'Complete room transformation bundles for master bedrooms and living rooms.',
    link: '/product-category/5-frames-set',
    buttonText: 'Discover 5-Frame Sets',
    badge: 'Gallery Sets',
    order: 4,
    isActive: true,
  },
];

/** Strip undefined keys */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result;
}

/** Get all banners with triple-layer fallback: LocalStorage -> API -> Firestore */
export async function getAllBannersFromFirestore(): Promise<HeroBanner[]> {
  // 1. Check LocalStorage first for instant loading
  let cached: HeroBanner[] | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        cached = JSON.parse(raw);
      }
    } catch {}
  }

  // 2. Fetch from API or Firestore in parallel
  try {
    const fetchPromise = (async () => {
      // Try API first (reliable server-side storage)
      try {
        const res = await fetch('/api/admin/banners');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.banners && json.banners.length > 0) {
            const list = json.banners.sort((a: HeroBanner, b: HeroBanner) => (a.order || 0) - (b.order || 0));
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
            }
            return list;
          }
        }
      } catch {}

      // Fallback to Firestore client SDK
      try {
        const snap = await getDocs(collection(db, BANNERS_COL));
        const firestoreBanners = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as HeroBanner[];

        if (firestoreBanners.length > 0) {
          const list = firestoreBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          }
          return list;
        }

        const delSnap = await getDocs(collection(db, DELETED_BANNERS_COL));
        const deletedIds = new Set(delSnap.docs.map((d) => d.id));
        return DEFAULT_HERO_BANNERS.filter((b) => !deletedIds.has(b.id));
      } catch {
        return cached || DEFAULT_HERO_BANNERS;
      }
    })();

    const timeoutPromise = new Promise<HeroBanner[]>((resolve) =>
      setTimeout(() => resolve(cached || DEFAULT_HERO_BANNERS), 2000)
    );

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return cached || DEFAULT_HERO_BANNERS;
  }
}

/** Save or update a banner with guaranteed multi-layer persistence */
export async function saveBannerToFirestore(banner: HeroBanner): Promise<void> {
  const docId = banner.id || `banner-${Date.now()}`;
  const bannerData: HeroBanner = {
    ...banner,
    id: docId,
    order: banner.order !== undefined ? banner.order : Date.now(),
    isActive: banner.isActive !== false,
  };

  // 1. Immediately update local storage & broadcast event
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let list: HeroBanner[] = raw ? JSON.parse(raw) : [...DEFAULT_HERO_BANNERS];
      const idx = list.findIndex((b) => b.id === docId);
      if (idx >= 0) {
        list[idx] = bannerData;
      } else {
        list.push(bannerData);
      }
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('lumiflick_banners_updated', { detail: list }));
    } catch {}
  }

  // 2. Best-effort API route save
  try {
    await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerData),
    });
  } catch (e) {
    console.warn('API banner save fallback notice:', e);
  }

  // 3. Best-effort Firestore write
  try {
    const ref = doc(db, BANNERS_COL, docId);
    const data = sanitizeForFirestore({
      ...bannerData,
      updatedAt: Date.now(),
    });

    try {
      await deleteDoc(doc(db, DELETED_BANNERS_COL, docId));
    } catch {}

    await setDoc(ref, data, { merge: true });
  } catch (firestoreErr) {
    console.warn('Firestore banner write notice (saved via local/API):', firestoreErr);
  }
}

/**
 * Server-only: write a banner straight to Firestore, no localStorage/fetch
 * side effects. Used by /api/admin/banners after the JSON store write
 * succeeds — safe to call from a route handler without recursing back into
 * that same route.
 */
export async function writeBannerToFirestore(banner: HeroBanner): Promise<void> {
  const data = sanitizeForFirestore({ ...banner, updatedAt: Date.now() });
  try {
    await deleteDoc(doc(db, DELETED_BANNERS_COL, banner.id));
  } catch {}
  await setDoc(doc(db, BANNERS_COL, banner.id), data, { merge: true });
}

/** Server-only: delete a banner straight from Firestore. */
export async function removeBannerFromFirestore(bannerId: string): Promise<void> {
  await deleteDoc(doc(db, BANNERS_COL, bannerId));
  await setDoc(doc(db, DELETED_BANNERS_COL, bannerId), { deletedAt: Date.now() });
}

/** Delete a banner with guaranteed multi-layer persistence */
export async function deleteBannerFromFirestore(bannerId: string): Promise<void> {
  // 1. Update localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        let list: HeroBanner[] = JSON.parse(raw);
        list = list.filter((b) => b.id !== bannerId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('lumiflick_banners_updated', { detail: list }));
      }
    } catch {}
  }

  // 2. API delete
  try {
    await fetch(`/api/admin/banners/${bannerId}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('API banner delete notice:', e);
  }

  // 3. Firestore delete
  try {
    await deleteDoc(doc(db, BANNERS_COL, bannerId));
    await setDoc(doc(db, DELETED_BANNERS_COL, bannerId), { deletedAt: Date.now() });
  } catch (err) {
    console.warn('Firestore delete notice:', err);
  }
}
