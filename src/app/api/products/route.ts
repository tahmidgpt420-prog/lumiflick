import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { productFromDb, categoryFromDb } from '@/lib/dbMappers';
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
    const where: string[] = [];
    const args: any[] = [];

    // Category filter — resolved against the categories table
    const normCategory = category.toLowerCase().trim();
    if (normCategory === 'best-selling' || normCategory === 'best selling') {
      where.push("(best_seller = TRUE OR category_slug = 'best-selling' OR category = 'best selling')");
    } else if (normCategory && normCategory !== 'all') {
      const categoryRows = await query('SELECT * FROM categories');
      const { slugs, names } = resolveCategoryFilterValues(category, categoryRows.map(categoryFromDb));
      if (slugs.length === 0 && names.length === 0) {
        // Unknown category — no matches, not an error.
        return NextResponse.json(
          { success: true, products: [], total: 0, hasMore: false },
          { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
        );
      }
      const orParts: string[] = [];
      if (slugs.length > 0) {
        orParts.push('category_slug IN (?)');
        args.push(slugs);
      }
      if (names.length > 0) {
        orParts.push('category IN (?)');
        args.push(names);
      }
      where.push(`(${orParts.join(' OR ')})`);
    }

    // Free-text search — "every word must match somewhere" semantics: each
    // token must appear in title, category or description. Values are bound
    // parameters; only LIKE wildcards need stripping.
    if (q) {
      const tokens = q
        .split(/\s+/)
        .map((t) => t.replace(/[%_\\]/g, ''))
        .filter(Boolean)
        .slice(0, 6);

      if (tokens.length === 0) {
        return NextResponse.json(
          { success: true, products: [], total: 0, hasMore: false },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      }

      for (const token of tokens) {
        where.push('(title LIKE ? OR category LIKE ? OR category_slug LIKE ? OR description LIKE ?)');
        const like = `%${token}%`;
        args.push(like, like, like, like);
      }
    }

    // Every sort ends in `id` so ties (same price, same review count) keep a
    // stable order across pages — otherwise products repeat or go missing
    // between offset pages.
    let orderBy: string;
    switch (sort) {
      case 'price-low':
        orderBy = 'price ASC, id ASC';
        break;
      case 'price-high':
        orderBy = 'price DESC, id ASC';
        break;
      case 'popular':
        // MySQL sorts NULLs last on DESC
        orderBy = 'review_count DESC, id ASC';
        break;
      case 'name':
        orderBy = 'title ASC, id ASC';
        break;
      default:
        // updated_at, not created_at — reverted per explicit request:
        // editing a product should bring it back to the top, same as
        // before. (Trade-off: order can reshuffle mid-edit-session if
        // many products get touched in a row — that's the accepted
        // behavior now, not a bug.)
        orderBy = 'updated_at DESC, id ASC';
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const [rows, [{ total }]] = await Promise.all([
      query(`SELECT ${LITE_COLUMNS} FROM products ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [
        ...args,
        limit,
        offset,
      ]),
      query<{ total: number }>(`SELECT COUNT(*) AS total FROM products ${whereSql}`, args),
    ]);

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
