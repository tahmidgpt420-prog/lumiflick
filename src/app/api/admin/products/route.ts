import { NextResponse } from 'next/server';
import { getAllProducts, saveProduct, getDeletedProductKeys } from '@/data/db';
import {
  saveProductToFirestore,
  getAllProductsFromFirestore,
  getDeletedProductIdsFromFirestore,
} from '@/lib/firestoreProducts';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';
import { products as staticProducts } from '@/data/products';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Merge static seed, JSON store, and Firestore (Firestore wins on id/slug
 * conflict). The JSON store is the reliable write target (see POST below);
 * this merge is what lets admin pages see a save immediately even while the
 * Firestore mirror is still catching up (or, right now, not configured —
 * see firestore.rules).
 */
async function getMergedProducts(): Promise<Product[]> {
  const jsonProducts = getAllProducts();
  const deletedKeys = getDeletedProductKeys();
  let firestoreProducts: Product[] = [];
  try {
    firestoreProducts = await getAllProductsFromFirestore();
    const firestoreDeleted = await getDeletedProductIdsFromFirestore();
    firestoreDeleted.forEach((k) => deletedKeys.add(k));
  } catch {
    // best-effort — fall through with whatever we have
  }

  const byKey = new Map<string, Product>();
  const keyOf = (p: Product) => p.slug || p.id;
  (staticProducts as Product[]).forEach((p) => byKey.set(keyOf(p), p));
  jsonProducts.forEach((p) => byKey.set(keyOf(p), p));
  firestoreProducts.forEach((p) => byKey.set(keyOf(p), p));

  return Array.from(byKey.values()).filter(
    (p) => !deletedKeys.has(p.id) && !deletedKeys.has(p.slug)
  );
}

export async function GET() {
  try {
    const products = await getMergedProducts();
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
