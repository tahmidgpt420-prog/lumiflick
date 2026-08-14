import { NextResponse } from 'next/server';
import { getAllBanners, saveBanner, getDeletedBannerIds } from '@/data/db';
import {
  writeBannerToFirestore,
  getAllBannersFromFirestoreOnly,
  getDeletedBannerIdsFromFirestore,
} from '@/lib/firestoreBanners';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';
import { HeroBanner } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Merge JSON store + Firestore (Firestore wins on id conflict). Same
 * per-instance-ephemeral problem as products/categories had: the JSON
 * store's /tmp write doesn't survive a request landing on a different
 * serverless instance, so Firestore is what actually makes a save (and a
 * delete) stick across reloads.
 */
async function getMergedBanners(): Promise<HeroBanner[]> {
  const jsonBanners = getAllBanners();
  const deletedIds = getDeletedBannerIds();
  let firestoreBanners: HeroBanner[] = [];
  try {
    firestoreBanners = await getAllBannersFromFirestoreOnly();
    const firestoreDeleted = await getDeletedBannerIdsFromFirestore();
    firestoreDeleted.forEach((id) => deletedIds.add(id));
  } catch {
    // best-effort — fall through with whatever we have
  }

  const byId = new Map<string, HeroBanner>();
  jsonBanners.forEach((b) => byId.set(b.id, b));
  firestoreBanners.forEach((b) => byId.set(b.id, b));

  return Array.from(byId.values())
    .filter((b) => !deletedIds.has(b.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function GET() {
  try {
    const banners = await getMergedBanners();
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error('GET /api/admin/banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Reliable primary store
    const created = saveBanner(body);

    // 2. Best-effort Firestore mirror
    try {
      await ensureFirebaseAdminAuth();
      await writeBannerToFirestore(created);
    } catch (firestoreErr) {
      console.warn('Firestore banner sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, banner: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/banners error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save banner' }, { status: 500 });
  }
}
