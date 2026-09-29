import 'server-only';
import { cache } from 'react';
import { query, queryOne } from '@/lib/db';
import { productFromDb, categoryFromDb, settingsFromDb } from '@/lib/dbMappers';
import { resolveCategoryFilterValues } from '@/utils/categoryHelpers';
import type { Category, Product } from '@/types';
import type { ProductsPageParams, ProductsPageResult } from '@/lib/products';

// Server-side catalog reads, shared by the /api routes (client-side "load
// more", search) and by pages that render their first screen of products
// straight into the HTML.

// Listing responses skip description, specifications, short_description and
// gallery_images — only the product detail page needs those. `variations`
// stays: ProductCard's one-click "add to cart" needs the real size/price.
const LITE_COLUMNS =
  'id, title, slug, category, category_slug, price, regular_price, price_range, image, sale, featured, best_seller, rating, review_count, tags, piece_selection_enabled, max_pieces, show_size_chart, variations, updated_at';

const DEFAULT_LIMIT = 16;
const MAX_LIMIT = 48;
const EMPTY_PAGE: ProductsPageResult = { products: [], total: 0, hasMore: false };

// cache(): one query per page render, however many components ask
// (layout, page, each homepage section). API routes aren't memoized.
export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await query('SELECT * FROM categories ORDER BY display_order IS NULL, display_order, name');
  return rows.map(categoryFromDb);
});

export async function getProductsPage(params: ProductsPageParams = {}): Promise<ProductsPageResult> {
  const category = (params.category || 'all').trim();
  const sort = params.sort || 'default';
  const q = (params.q || '').trim();
  const offset = Math.max(0, Number(params.offset) || 0);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(params.limit) || DEFAULT_LIMIT));

  const where: string[] = [];
  const args: any[] = [];

  // Category filter — resolved against the categories table
  const normCategory = category.toLowerCase().trim();
  if (normCategory === 'best-selling' || normCategory === 'best selling') {
    where.push("(best_seller = TRUE OR category_slug = 'best-selling' OR category = 'best selling')");
  } else if (normCategory && normCategory !== 'all') {
    const { slugs, names } = resolveCategoryFilterValues(category, await getCategories());
    if (slugs.length === 0 && names.length === 0) {
      // Unknown category — no matches, not an error.
      return EMPTY_PAGE;
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
      return EMPTY_PAGE;
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

  return { products: rows.map(productFromDb), total, hasMore: offset + rows.length < total };
}

/** Full row for one product. Old links sometimes use the row id instead of the slug. */
export async function getProductBySlug(rawSlug: string): Promise<Product | null> {
  const raw = rawSlug.trim();
  const row =
    (await queryOne('SELECT * FROM products WHERE slug = ?', [raw.toLowerCase()])) ??
    (await queryOne('SELECT * FROM products WHERE id = ?', [raw]));
  return row ? productFromDb(row) : null;
}

/** Up to 4 products from the same category, topped up from the whole catalog. */
export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const [sameCategory, fallback] = await Promise.all([
    getProductsPage({ category: product.categorySlug || 'best-selling', limit: 5 }),
    getProductsPage({ limit: 9 }),
  ]);
  const seen = new Set([product.slug]);
  const related: Product[] = [];
  for (const p of [...sameCategory.products, ...fallback.products]) {
    if (related.length >= 4) break;
    if (seen.has(p.slug)) continue;
    related.push(p);
    seen.add(p.slug);
  }
  return related;
}

/** Public store settings — everything except the two large frame-effect images. */
export async function getStoreSettings() {
  const row = await queryOne(
    'SELECT store_name, phone, email, address, inside_dhaka_delivery, outside_dhaka_delivery, promo_notice, promo_bar_items, header_scripts, body_scripts, footer_scripts FROM settings WHERE id = 1'
  );
  if (!row) throw new Error('settings row missing');
  return settingsFromDb(row);
}
