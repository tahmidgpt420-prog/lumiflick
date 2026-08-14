import { NextResponse } from 'next/server';
import { getAllReviews, saveReview, getDeletedReviewIds } from '@/data/db';
import {
  saveReviewToFirestore,
  getAllReviewsFromFirestore,
  getDeletedReviewIdsFromFirestore,
} from '@/lib/firestoreReviews';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';
import { CustomerReview } from '@/types';

export const dynamic = 'force-dynamic';

/** Merge JSON store + Firestore (Firestore wins on id conflict). See firestoreReviews.ts. */
async function getMergedReviews(): Promise<CustomerReview[]> {
  const jsonReviews = getAllReviews();
  const deletedIds = getDeletedReviewIds();
  let firestoreReviews: CustomerReview[] = [];
  try {
    firestoreReviews = await getAllReviewsFromFirestore();
    const firestoreDeleted = await getDeletedReviewIdsFromFirestore();
    firestoreDeleted.forEach((id) => deletedIds.add(id));
  } catch {
    // best-effort — fall through with whatever we have
  }

  const byId = new Map<string, CustomerReview>();
  jsonReviews.forEach((r) => byId.set(r.id, r));
  firestoreReviews.forEach((r) => byId.set(r.id, r));

  return Array.from(byId.values()).filter((r) => !deletedIds.has(r.id));
}

// GET is public (see middleware.ts) — the storefront's /reviews page reads it.
export async function GET() {
  try {
    const reviews = await getMergedReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 });
  }
}

// POST requires an admin session — enforced by middleware.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Reliable primary store
    const created = saveReview(body);

    // 2. Best-effort Firestore mirror
    try {
      await ensureFirebaseAdminAuth();
      await saveReviewToFirestore(created);
    } catch (firestoreErr) {
      console.warn('Firestore review sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 500 });
  }
}
