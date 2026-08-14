import 'server-only';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CustomerReview } from '@/types';

const REVIEWS_COL = 'customer_reviews';
const DELETED_REVIEWS_COL = 'deleted_customer_reviews';

/** Strip undefined keys before saving to Firestore (it rejects them). */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = sanitizeForFirestore(value);
  }
  return result;
}

/**
 * Server-only Firestore mirror for reviews, matching the pattern already
 * used for products/categories/banners. Reviews previously had no Firestore
 * backing at all — purely JSON-store, which doesn't survive Vercel routing
 * a later request to a different serverless instance than the one that
 * wrote it (the same reason products/categories flickered before that was
 * fixed). This is what makes a save or delete actually stick.
 */
export async function saveReviewToFirestore(review: CustomerReview): Promise<void> {
  const data = sanitizeForFirestore({ ...review, updatedAt: Date.now() });
  try {
    await deleteDoc(doc(db, DELETED_REVIEWS_COL, review.id));
  } catch {}
  await setDoc(doc(db, REVIEWS_COL, review.id), data, { merge: true });
}

export async function deleteReviewFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, REVIEWS_COL, id));
  await setDoc(doc(db, DELETED_REVIEWS_COL, id), { deletedAt: Date.now() });
}

export async function getAllReviewsFromFirestore(): Promise<CustomerReview[]> {
  try {
    const snap = await getDocs(collection(db, REVIEWS_COL));
    return snap.docs.map((d) => d.data() as CustomerReview);
  } catch {
    return [];
  }
}

export async function getDeletedReviewIdsFromFirestore(): Promise<Set<string>> {
  try {
    const snap = await getDocs(collection(db, DELETED_REVIEWS_COL));
    return new Set(snap.docs.map((d) => d.id));
  } catch {
    return new Set();
  }
}
