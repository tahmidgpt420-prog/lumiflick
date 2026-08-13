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

/** Get all banners from Firestore with timeout protection */
export async function getAllBannersFromFirestore(): Promise<HeroBanner[]> {
  const fetchPromise = (async () => {
    const snap = await getDocs(collection(db, BANNERS_COL));
    const firestoreBanners = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as HeroBanner[];

    // If Firestore has banners, sort by order and return
    if (firestoreBanners.length > 0) {
      return firestoreBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Check if deleted collection has entries (meaning user deleted default banners)
    const delSnap = await getDocs(collection(db, DELETED_BANNERS_COL));
    const deletedIds = new Set(delSnap.docs.map((d) => d.id));
    
    return DEFAULT_HERO_BANNERS.filter((b) => !deletedIds.has(b.id));
  })();

  const timeoutPromise = new Promise<HeroBanner[]>((resolve) =>
    setTimeout(() => resolve(DEFAULT_HERO_BANNERS), 2500)
  );

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (e) {
    console.warn('Error loading banners from Firestore, using defaults:', e);
    return DEFAULT_HERO_BANNERS;
  }
}

/** Save or update a banner in Firestore */
export async function saveBannerToFirestore(banner: HeroBanner): Promise<void> {
  const docId = banner.id || `banner-${Date.now()}`;
  const ref = doc(db, BANNERS_COL, docId);
  const data = sanitizeForFirestore({
    ...banner,
    id: docId,
    order: banner.order !== undefined ? banner.order : Date.now(),
    isActive: banner.isActive !== false,
    updatedAt: Date.now(),
  });

  // Ensure not in deleted collection
  try {
    await deleteDoc(doc(db, DELETED_BANNERS_COL, docId));
  } catch {}

  await setDoc(ref, data, { merge: true });
}

/** Delete a banner from Firestore */
export async function deleteBannerFromFirestore(bannerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BANNERS_COL, bannerId));
    await setDoc(doc(db, DELETED_BANNERS_COL, bannerId), { deletedAt: Date.now() });
  } catch (err) {
    console.error('Error deleting banner from Firestore:', err);
  }
}
