import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, categoryFromDb } from '@/lib/supabaseMappers';
import { resolveCategoryFilterValues } from '@/utils/categoryHelpers';

// Public, unauthenticated. Paginated + filtered + sorted product listing —
// this is what shop/category pages and homepage sections hit instead of
// downloading the entire catalog. Deliberately column-limited: excludes
// description, specifications, short_description, gallery_images — those
// are only needed on a single product's detail page (see /api/products/
// [slug]) and were the bulk of every row's bytes. `variations` stays,
// since ProductCard's one-click "add to cart" needs it for a correct
// size/price, not just display.
const LITE_COLUMNS =
  'id, title, slug, category, category_slug, price, regular_price, price_range, image, sale, featured, best_seller, rating, review_count, tags, piece_selection_enabled, max_pieces, show_size_chart, variations, updated_at';

const DEFAULT_LIMIT = 16;
const MAX_LIMIT = 48;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = (params.get('category') || 'all').trim();
  const sort = params.get('sort') || 'default';
  const q = (params.get('q') || '').trim();
  const offset = Math.max(0, Number(params.get('offset')) || 0);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.get('limit')) || DEFAULT_LIMIT));

  try {
    let query = supabaseAdmin.from('products').select(LITE_COLUMNS, { count: 'exact' });

    // Category filter — resolved against the (small, cheap) categories
    // table so parent categories include their subcategory products, same
    // hierarchy logic the old client-side matchesCategory used.
    const normCategory = category.toLowerCase();
    if (normCategory === 'best-selling') {
      query = query.or('best_seller.eq.true,category_slug.eq.best-selling,category.ilike.best selling');
    } else if (normCategory && normCategory !== 'all') {
      const { data: categoryRows, error: catErr } = await supabaseAdmin
        .from('categories')
        .select('*');
      if (catErr) throw catErr;
      const { slugs, names } = resolveCategoryFilterValues(
        category,
        (categoryRows || []).map(categoryFromDb)
      );
      if (slugs.length === 0 && names.length === 0) {
        // Unknown category — no matches, not an error.
        return NextResponse.json(
          { success: true, products: [], total: 0, hasMore: false },
          { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
        );
      }
      const slugList = slugs.map((s) => `"${s}"`).join(',');
      const nameList = names.map((n) => `"${n}"`).join(',');
      const orParts = [];
      if (slugs.length) orParts.push(`category_slug.in.(${slugList})`);
      if (names.length) orParts.push(`category.in.(${nameList})`);
      query = query.or(orParts.join(','));
    }

    // Free-text search — same "every word must match somewhere" semantics
    // the old client-side search had (one .or() per token, chained calls
    // AND together), just evaluated server-side against title/category/
    // tags/description. Only lite columns are ever SELECTed back, so a
    // description match never costs a description download.
    if (q) {
      // Strip PostgREST .or() filter-string metacharacters — these values
      // get concatenated straight into filter expressions, not bound as
      // parameters, so any of , ( ) would let a crafted query re-shape the
      // filter itself rather than just search text.
      const tokens = q
        .split(/\s+/)
        .map((t) => t.replace(/[%,()."]/g, ''))
        .filter(Boolean)
        .slice(0, 6);

      if (tokens.length === 0) {
        return NextResponse.json(
          { success: true, products: [], total: 0, hasMore: false },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      }

      for (const token of tokens) {
        // No tags column here — PostgREST's filter DSL can't ilike inside a
        // jsonb array (no ::text cast support), and `cs` (contains) needs
        // an exact element match, not substring. title/category/description
        // cover what tags would have added in practice.
        query = query.or(
          `title.ilike.%${token}%,category.ilike.%${token}%,category_slug.ilike.%${token}%,description.ilike.%${token}%`
        );
      }
    }

    switch (sort) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'popular':
        query = query.order('review_count', { ascending: false, nullsFirst: false });
        break;
      case 'name':
        query = query.order('title', { ascending: true });
        break;
      default:
        // updated_at, not created_at — reverted per explicit request:
        // editing a product should bring it back to the top, same as
        // before. (Trade-off: order can reshuffle mid-edit-session if
        // many products get touched in a row — that's the accepted
        // behavior now, not a bug.)
        query = query.order('updated_at', { ascending: false }).order('id', { ascending: true });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    const rows = data || [];
    const total = count ?? rows.length;

    return NextResponse.json(
      {
        success: true,
        products: rows.map(productFromDb),
        total,
        hasMore: offset + rows.length < total,
      },
      {
        headers: {
          'Cache-Control': q
            ? 'no-store'
            : 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load products' }, { status: 500 });
  }
}
