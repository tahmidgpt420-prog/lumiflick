import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, categoryFromDb } from '@/lib/supabaseMappers';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';

export const revalidate = 900;

const CACHE_TTL_MS = 15 * 60 * 1000;

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

async function getCatalog() {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.data;

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
    if (cached) return NextResponse.json({ success: true, ...cached.data });
    // Last-resort fallback if Supabase itself is unreachable.
    return NextResponse.json({ success: true, products: staticProducts, categories: staticCategories });
  }
}
