import { NextResponse } from 'next/server';
import { getAllProducts, saveProduct } from '@/data/db';
import { saveProductToFirestore } from '@/lib/firestoreProducts';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Product title is required' }, { status: 400 });
    }

    // 1. Reliable primary store — always awaited, errors surface to the caller.
    const created = saveProduct(body);

    // 2. Best-effort Firestore mirror (the public storefront reads Firestore first).
    // No-ops safely until ADMIN_FIREBASE_EMAIL/PASSWORD are provisioned — see firestore.rules.
    try {
      await ensureFirebaseAdminAuth();
      await saveProductToFirestore(created);
    } catch (firestoreErr) {
      console.warn('Firestore product sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save product' }, { status: 500 });
  }
}
