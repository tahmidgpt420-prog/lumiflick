import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, upsert } from '@/lib/db';
import { productFromDb, productToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  // updated_at — reverted per explicit request: editing a product should
  // bring it back to the top.
  newest: { column: 'updated_at', ascending: false },
  oldest: { column: 'updated_at', ascending: true },
  'name-asc': { column: 'title', ascending: true },
  'name-desc': { column: 'title', ascending: false },
  category: { column: 'category', ascending: true },
};
const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  if (mode === 'page') {
    try {
      const sortKey = searchParams.get('sort') || 'newest';
      const sort = SORT_MAP[sortKey] || SORT_MAP.newest;
      const category = searchParams.get('category') || 'all';
      const search = searchParams.get('search')?.trim() || '';
      const page = Number(searchParams.get('page') || '0');
      const from = page * PAGE_SIZE;

      // Comparisons are case-insensitive (utf8mb4_unicode_ci collation).
      const where: string[] = [];
      const args: any[] = [];

      if (category !== 'all') {
        // Fetch sub-categories if this is a parent category
        const subCats = await query<{ slug: string; name: string }>(
          'SELECT slug, name FROM categories WHERE parent_slug = ?',
          [category]
        );
        const matchingSlugs = Array.from(new Set([category, ...subCats.map((c) => c.slug)].filter(Boolean)));
        const matchingNames = Array.from(new Set(subCats.map((c) => c.name).filter(Boolean)));

        where.push('(category_slug IN (?) OR category IN (?))');
        args.push(matchingSlugs, [...matchingSlugs, ...matchingNames]);
      }

      if (search) {
        const like = `%${search.replace(/[%_\\]/g, '')}%`;
        where.push('(title LIKE ? OR category LIKE ? OR category_slug LIKE ?)');
        args.push(like, like, like);
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const [rows, [{ count }]] = await Promise.all([
        query(
          `SELECT * FROM products ${whereSql} ORDER BY ${sort.column} ${sort.ascending ? 'ASC' : 'DESC'}, id ASC LIMIT ? OFFSET ?`,
          [...args, PAGE_SIZE, from]
        ),
        query<{ count: number }>(`SELECT COUNT(*) AS count FROM products ${whereSql}`, args),
      ]);

      const products = rows.map(productFromDb);
      const hasMore = from + products.length < count;

      return NextResponse.json({ success: true, products, totalCount: count, hasMore, nextPage: page + 1 });
    } catch (error) {
      console.error('GET /api/admin/products?mode=page error:', error);
      return NextResponse.json({ success: false, error: 'Failed to load products page' }, { status: 500 });
    }
  }

  // Full list — cheap on MySQL even at hundreds of rows, unlike Firestore's
  // per-document billing. Used by the dashboard's stat cards.
  try {
    const rows = await query('SELECT * FROM products ORDER BY updated_at DESC');
    return NextResponse.json({ success: true, products: rows.map(productFromDb) });
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

    const slug =
      body.slug ||
      String(body.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const id = body.id || `prod_${slug}_${Date.now()}`;
    const category = body.category || 'Modern Frames';
    const categorySlug =
      body.categorySlug ||
      category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = body.image || '/logo.png';

    const row = productToDb({
      shortDescription: 'Handcrafted luxury wall frame with UV matte textured finish.',
      description: '<p>Transform any blank wall into a sophisticated statement with LUMIFLICK.</p>',
      regularPrice: body.price || 1250,
      galleryImages: [image],
      ...body,
      id,
      slug,
      category,
      categorySlug,
      image,
    });
    await upsert('products', 'id', row);
    const data = await queryOne('SELECT * FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true, product: productFromDb(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save product' }, { status: 500 });
  }
}
