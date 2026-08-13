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
import { Product } from '@/types';

const COL = 'products';
const DELETED_COL = 'deleted_products';

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
