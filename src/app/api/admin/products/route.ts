import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, saveProduct, getDeletedProductKeys } from '@/data/db';
import {
  saveProductToFirestore,
  getAllProductsFromFirestore,
  getDeletedProductIdsFromFirestore,
  getProductsPageFromFirestore,
  getProductsCountFromFirestore,
  ProductSortField,
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

const SORT_MAP: Record<string, { sortField: ProductSortField; direction: 'asc' | 'desc' }> = {
  newest: { sortField: 'updatedAt', direction: 'desc' },
  oldest: { sortField: 'updatedAt', direction: 'asc' },
  'name-asc': { sortField: 'title', direction: 'asc' },
  'name-desc': { sortField: 'title', direction: 'desc' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  // Real paginated read — only pulls `pageSize` documents from Firestore,
  // not the whole collection. This is the default admin-panel browse mode;
  // search still needs the full merge below (no way around scanning
  // everything for a substring search).
  if (mode === 'page') {
    try {
      const sortKey = searchParams.get('sort') || 'newest';
      const sort = SORT_MAP[sortKey] || SORT_MAP.newest;
      const category = searchParams.get('category') || 'all';
      const cursorParam = searchParams.get('cursor');
      const cursor = cursorParam
        ? (sort.sortField === 'updatedAt' ? Number(cursorParam) : cursorParam)
        : null;

      const { products, nextCursor } = await getProductsPageFromFirestore({
        sortField: sort.sortField,
        direction: sort.direction,
        category,
        cursor,
      });

      // Total count only on the first page — avoid an extra read on every
      // "Load More" click.
      const totalCount = cursor === null ? await getProductsCountFromFirestore() : undefined;

      return NextResponse.json({ success: true, products, nextCursor, totalCount });
    } catch (error) {
      console.error('GET /api/admin/products?mode=page error:', error);
      return NextResponse.json({ success: false, error: 'Failed to load products page' }, { status: 500 });
    }
  }

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
