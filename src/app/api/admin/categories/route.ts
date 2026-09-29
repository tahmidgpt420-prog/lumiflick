import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { execute, query, queryOne, upsert } from '@/lib/db';
import { categoryFromDb, categoryToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

const RESERVED_SLUGS = new Set(['best-selling']);

async function listCategories() {
  const rows = await query('SELECT * FROM categories ORDER BY display_order IS NULL, display_order, name');
  return rows.map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));
}

function triggerCachePurge() {
  try {
    revalidatePath('/api/categories');
    revalidatePath('/');
    revalidatePath('/shop');
  } catch (err) {
    console.warn('Revalidation warning:', err);
  }
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, categories: await listCategories() });
  } catch (error) {
    console.error('GET /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: 'name and slug are required' }, { status: 400 });
    }
    if (RESERVED_SLUGS.has(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error:
            '"best-selling" is reserved — use the "Feature on Best Sellers Section" toggle on each product instead of a category.',
        },
        { status: 400 }
      );
    }

    const cleanId = body.id || `cat_${body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') || 'gen'}`;
    const row = categoryToDb({
      ...body,
      id: cleanId,
    });

    // Rename: slug is primary key, so update children if parent slug changed
    if (body.oldSlug && body.oldSlug !== body.slug) {
      await execute('DELETE FROM categories WHERE slug = ?', [body.oldSlug]);
      // Update any child subcategories pointing to oldSlug
      await execute('UPDATE categories SET parent_slug = ? WHERE parent_slug = ?', [body.slug, body.oldSlug]);
    }

    await upsert('categories', 'slug', row);
    const data = await queryOne('SELECT * FROM categories WHERE slug = ?', [row.slug]);

    triggerCachePurge();
    return NextResponse.json({ success: true, category: categoryFromDb(data), categories: await listCategories() });
  } catch (error: any) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save category' }, { status: 500 });
  }
}

// Drag-to-reorder: body is { order: [{ slug, order }, ...] }
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updates: { slug: string; order: number }[] = body.order;
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: false, error: 'order array is required' }, { status: 400 });
    }

    await Promise.all(
      updates.map(({ slug, order }) =>
        execute('UPDATE categories SET display_order = ? WHERE slug = ?', [order, slug])
      )
    );

    triggerCachePurge();
    return NextResponse.json({ success: true, categories: await listCategories() });
  } catch (error) {
    console.error('PATCH /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder categories' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug, id } = await request.json();
    const targetSlug = slug || '';
    if (!targetSlug && !id) {
      return NextResponse.json({ success: false, error: 'slug or id is required' }, { status: 400 });
    }

    // First detach any child subcategories so they don't become ghost rows
    if (targetSlug) {
      await execute('UPDATE categories SET parent_slug = NULL, parent_id = NULL WHERE parent_slug = ?', [targetSlug]);
      await execute('DELETE FROM categories WHERE slug = ?', [targetSlug]);
    } else if (id) {
      await execute('DELETE FROM categories WHERE id = ?', [id]);
    }

    triggerCachePurge();
    return NextResponse.json({ success: true, categories: await listCategories() });
  } catch (error) {
    console.error('DELETE /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
