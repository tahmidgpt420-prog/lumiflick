import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

const COL = 'products';
const DELETED_COL = 'deleted_products';

/** Save or update a product in Firestore */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const ref = doc(db, COL, product.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...product, updatedAt: serverTimestamp() };
  await setDoc(ref, data, { merge: true });
}

/** Get all raw products from Firestore */
export async function getAllProductsFromFirestore(): Promise<Product[]> {
  try {
    const q = query(collection(db, COL), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      if (data.updatedAt instanceof Timestamp) {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return data as Product;
    });
  } catch {
    return [];
  }
}

/** Get list of deleted product IDs */
export async function getDeletedProductIdsFromFirestore(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, DELETED_COL));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

/**
 * Universal product getter: merges Firestore products + static products,
 * excluding any deleted product IDs.
 */
export async function getUniversalProducts(): Promise<Product[]> {
  try {
    const [firestoreProds, deletedIds] = await Promise.all([
      getAllProductsFromFirestore(),
      getDeletedProductIdsFromFirestore(),
    ]);

    const deletedSet = new Set(deletedIds);

    // Filter static initial products by deleted list
    const activeStaticProds = (initialProducts as Product[]).filter(
      (p) => !deletedSet.has(p.id) && !deletedSet.has(p.slug)
    );

    // Merge Firestore products (they take priority over static)
    const map = new Map<string, Product>();

    // Add active static products first
    for (const p of activeStaticProds) {
      map.set(p.slug || p.id, p);
    }

    // Add/overwrite with Firestore products (unless deleted)
    for (const p of firestoreProds) {
      if (!deletedSet.has(p.id) && !deletedSet.has(p.slug)) {
        map.set(p.slug || p.id, p);
      }
    }

    return Array.from(map.values());
  } catch {
    return initialProducts as Product[];
  }
}

/** Get a single product by slug from Firestore or static */
export async function getProductBySlugFromFirestore(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, COL), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      return data as Product;
    }
  } catch {
    // Fall back
  }
  return null;
}

/** Delete a product permanently from Firestore AND mark in deleted collection */
export async function deleteProductFromFirestore(idOrSlug: string): Promise<void> {
  try {
    // 1. Remove from products collection
    await deleteDoc(doc(db, COL, idOrSlug));

    // 2. Add to deleted_products collection to exclude static fallbacks
    await setDoc(doc(db, DELETED_COL, idOrSlug), {
      deletedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
  }
}
