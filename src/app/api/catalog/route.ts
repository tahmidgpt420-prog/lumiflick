import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, categoryFromDb } from '@/lib/supabaseMappers';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';

// This cache existed to protect Firestore's per-document-read billing —
// that constraint is gone now that this reads Postgres (Supabase), which
// bills by compute time, not by row. A short cache is still worth keeping
// as burst protection (a traffic spike shouldn't mean one Postgres query
// per visitor), but it no longer needs to be aggressive — a long TTL here
// just makes admin edits (new categories, product changes) look broken
// for up to 15 minutes for no real benefit anymore.
export const revalidate = 20;

const CACHE_TTL_MS = 20 * 1000;

let cached: { data: { products: any[]; categories: any[] }; expiresAt: number } | null = null;
let inflight: Promise<{ products: any[]; categories: any[] }> | null = null;

async function buildCatalog() {
  const [{ data: productRows, error: pErr }, { data: categoryRows, error: cErr }] = await Promise.all([
    supabaseAdmin.from('products').select('*'),
    supabaseAdmin.from('categories').select('*'),
  ]);

  if (pErr || cErr) throw pErr || cErr;

  return {
    products: (productRows || []).map(productFromDb),
    categories: (categoryRows || []).map(categoryFromDb),
  };
}

async function getCatalog(bypassCache: boolean) {
  const now = Date.now();
  if (!bypassCache && cached && cached.expiresAt > now) return cached.data;

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

export async function GET(request: NextRequest) {
  try {
    // ProductContext's forced refresh (called right after an admin save)
    // passes this so the admin sees their own change immediately instead
    // of waiting out the burst-protection cache.
    const bypassCache = request.nextUrl.searchParams.get('fresh') === '1';
    const data = await getCatalog(bypassCache);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('GET /api/catalog error:', error);
    if (cached) return NextResponse.json({ success: true, ...cached.data });
    // Last-resort fallback if Supabase itself is unreachable.
    return NextResponse.json({ success: true, products: staticProducts, categories: staticCategories });
  }
}
