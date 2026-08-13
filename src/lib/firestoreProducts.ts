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

const COL = 'products';

/** Save or update a product in Firestore */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const ref = doc(db, COL, product.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...product, updatedAt: serverTimestamp() };
  await setDoc(ref, data, { merge: true });
}

/** Get all products from Firestore, newest first */
export async function getAllProductsFromFirestore(): Promise<Product[]> {
  try {
    const q = query(collection(db, COL), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      // Convert Firestore Timestamp → ISO string if needed
      if (data.updatedAt instanceof Timestamp) {
        data.updatedAt = data.updatedAt.toDate().toISOString();
      }
      return data as Product;
    });
  } catch {
    return [];
  }
}

/** Get a single product by slug */
export async function getProductBySlugFromFirestore(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, COL), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Product;
  } catch {
    return null;
  }
}

/** Delete a product from Firestore */
export async function deleteProductFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
