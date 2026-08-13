import { NextResponse } from 'next/server';
import { getAllBanners, saveBanner } from '@/data/db';
import { writeBannerToFirestore } from '@/lib/firestoreBanners';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = getAllBanners();
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
