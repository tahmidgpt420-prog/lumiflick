import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Category } from '@/types';

const COL = 'products';
const DELETED_COL = 'deleted_products';
const CATEGORIES_COL = 'categories';

/** Strip any undefined keys recursively before saving to Firestore */
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

/** Save or update a product in Firestore */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const ref = doc(db, COL, product.id);
  const data = sanitizeForFirestore({ ...product, updatedAt: Date.now() });
  await setDoc(ref, data, { merge: true });
}

/** Get all products from Firestore */
export async function getAllProductsFromFirestore(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map((d) => d.data() as Product);
  } catch {
    return [];
  }
}

/** Get deleted product IDs */
export async function getDeletedProductIdsFromFirestore(): Promise<Set<string>> {
  try {
    const snap = await getDocs(collection(db, DELETED_COL));
    return new Set(snap.docs.map((d) => d.id));
  } catch {
    return new Set();
  }
}

/** Get a single product by slug */
export async function getProductBySlugFromFirestore(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, COL), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as Product;
  } catch { /* fall through */ }
  return null;
}

/** Delete a product from Firestore AND blacklist it */
export async function deleteProductFromFirestore(idOrSlug: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COL, idOrSlug));
    await setDoc(doc(db, DELETED_COL, idOrSlug), { deletedAt: Date.now() });
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
  }
}

// ─── Category Firestore helpers ───────────────────────────────────────
const DELETED_CATEGORIES_COL = 'deleted_categories';

/** Get all categories from Firestore */
export async function getAllCategoriesFromFirestore(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, CATEGORIES_COL));
    return snap.docs.map((d) => d.data() as Category);
  } catch {
    return [];
  }
}

/** Get deleted category slugs from Firestore */
export async function getDeletedCategorySlugsFromFirestore(): Promise<Set<string>> {
  try {
    const snap = await getDocs(collection(db, DELETED_CATEGORIES_COL));
    return new Set(snap.docs.map((d) => d.id));
  } catch {
    return new Set();
  }
}

/** Save or update a category in Firestore with optional oldSlug cleanup */
export async function saveCategoryToFirestore(category: Category, oldSlug?: string): Promise<void> {
  const docId = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // If slug was renamed during edit, clean up the old document
  if (oldSlug && oldSlug !== docId) {
    try {
      await deleteDoc(doc(db, CATEGORIES_COL, oldSlug));
      await setDoc(doc(db, DELETED_CATEGORIES_COL, oldSlug), { deletedAt: Date.now() });
    } catch (e) {
      console.warn('Error cleaning up old category slug:', e);
    }
  }

  // Ensure this active slug is not in deleted_categories
  try {
    await deleteDoc(doc(db, DELETED_CATEGORIES_COL, docId));
  } catch {}

  const ref = doc(db, CATEGORIES_COL, docId);
  const data = sanitizeForFirestore({ ...category, slug: docId, updatedAt: Date.now() });
  await setDoc(ref, data, { merge: true });
}

/** Delete a category from Firestore and blacklist its slug */
export async function deleteCategoryFromFirestore(slug: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COL, slug));
    await setDoc(doc(db, DELETED_CATEGORIES_COL, slug), { deletedAt: Date.now() });
  } catch (err) {
    console.error('Error deleting category from Firestore:', err);
  }
}
