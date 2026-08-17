import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, categoryFromDb } from '@/lib/supabaseMappers';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';

// Freshness now lives at the HTTP layer (Cache-Control below), which
// Vercel's CDN respects and shares across every lambda instance/region.
// That's strictly better than the old per-lambda in-memory TTL cache this
// route used to keep: at this site's traffic, requests to any one warm
// lambda arrive further apart than a short TTL, so that cache almost never
// hit — every "cached" request was still a fresh Supabase read in practice.
//
// `inflight` stays: it's a same-instance concurrency guard (collapses N
// simultaneous requests hitting a cold/expired CDN entry into one Supabase
// call), not a freshness cache, and still earns its keep during a
// cache-miss burst. `lastGood` is a resilience fallback for the catch
// block below, not a serving path — normal requests always go through
// buildCatalog() (or the CDN cache in front of this function).
let inflight: Promise<{ products: any[]; categories: any[] }> | null = null;
let lastGood: { products: any[]; categories: any[] } | null = null;

async function buildCatalog() {
  const [{ data: productRows, error: pErr }, { data: categoryRows, error: cErr }] = await Promise.all([
    supabaseAdmin.from('products').select('*'),
    supabaseAdmin.from('categories').select('*').order('display_order').order('name'),
  ]);

  if (pErr || cErr) throw pErr || cErr;

  const data = {
    products: (productRows || []).map(productFromDb),
    categories: (categoryRows || []).map(categoryFromDb),
  };
  lastGood = data;
  return data;
}

async function getCatalog() {
  if (!inflight) {
    inflight = buildCatalog().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function GET(request: NextRequest) {
  // ProductContext's forced refresh (called right after an admin save)
  // passes this so the admin sees their own change immediately instead of
  // waiting out the CDN cache's TTL.
  const bypassCache = request.nextUrl.searchParams.get('fresh') === '1';

  try {
    // Same fetch either way — there's no more in-process TTL cache to skip.
    // bypassCache only changes the Cache-Control header below, so the CDN
    // doesn't keep serving a stale copy back to this same admin afterward.
    // Still routed through getCatalog() so a concurrent normal + fresh
    // request collapse into one Supabase call instead of two.
    const data = await getCatalog();
    return NextResponse.json(
      { success: true, ...data },
      {
        headers: {
          'Cache-Control': bypassCache
            ? 'no-store'
            : 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/catalog error:', error);
    if (lastGood) {
      return NextResponse.json({ success: true, ...lastGood }, { headers: { 'Cache-Control': 'no-store' } });
    }
    // Last-resort fallback if Supabase itself is unreachable.
    return NextResponse.json(
      { success: true, products: staticProducts, categories: staticCategories },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
