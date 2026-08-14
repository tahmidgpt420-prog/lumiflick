import { NextResponse } from 'next/server';
import {
  getAllProductsFromFirestore,
  getDeletedProductIdsFromFirestore,
  getAllCategoriesFromFirestore,
  getDeletedCategorySlugsFromFirestore,
} from '@/lib/firestoreProducts';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';
import { Product, Category } from '@/types';

// Public, unauthenticated, read-only. This is what actually protects
// Firestore from load: without it, every visitor's browser called the
// Firestore client SDK directly (4 full collection reads each), so cost
// scaled with concurrent traffic instead of with how often the catalog
// changes. Caching this server-side means Firestore gets hit at most once
// per CACHE_TTL_MS per warm instance, no matter how many people are
// browsing at once.
export const revalidate = 60;

const CACHE_TTL_MS = 60 * 1000;

interface CatalogPayload {
  products: Product[];
  categories: Category[];
}

let cached: { data: CatalogPayload; expiresAt: number } | null = null;
let inflight: Promise<CatalogPayload> | null = null;

async function buildCatalog(): Promise<CatalogPayload> {
  const [firestoreProds, deletedIds, firestoreCats, deletedCatSlugs] = await Promise.all([
    getAllProductsFromFirestore(),
    getDeletedProductIdsFromFirestore(),
    getAllCategoriesFromFirestore(),
    getDeletedCategorySlugsFromFirestore(),
  ]);

  const activeFirestore = firestoreProds.filter(
    (p) => !deletedIds.has(p.id) && !deletedIds.has(p.slug)
  );
  const activeStatic = (staticProducts as Product[]).filter(
    (p) =>
      !deletedIds.has(p.id) &&
      !deletedIds.has(p.slug) &&
      !activeFirestore.some((fp) => fp.slug === p.slug || (fp.id && fp.id === p.id))
  );
  const products = [...activeFirestore, ...activeStatic];

  const activeFirestoreCats = firestoreCats.filter((c) => !deletedCatSlugs.has(c.slug));
  const firestoreCatSlugs = new Set(activeFirestoreCats.map((c) => c.slug));
  const activeStaticCats = staticCategories.filter(
    (c) => !deletedCatSlugs.has(c.slug) && !firestoreCatSlugs.has(c.slug)
  );
  const categories = [...activeFirestoreCats, ...activeStaticCats];

  return { products, categories };
}

async function getCatalog(): Promise<CatalogPayload> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.data;

  // Coalesce concurrent cache-miss requests on the same warm instance into
  // one Firestore round trip instead of one per request.
  if (!inflight) {
    inflight = buildCatalog()
      .then((data) => {
        cached = { data, expiresAt: Date.now() + CACHE_TTL_MS };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function GET() {
  try {
    const data = await getCatalog();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('GET /api/catalog error:', error);
    // Stale-if-error: serve the last good cache rather than a hard failure.
    if (cached) return NextResponse.json({ success: true, ...cached.data });
    return NextResponse.json({ success: false, error: 'Failed to load catalog' }, { status: 500 });
  }
}
