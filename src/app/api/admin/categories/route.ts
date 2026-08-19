import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categoryFromDb, categoryToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

const RESERVED_SLUGS = new Set(['best-selling']);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('categories').select('*').order('display_order').order('name');
    if (error) throw error;
    const categories = (data || []).map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));
    return NextResponse.json({ success: true, categories });
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
      await supabaseAdmin.from('categories').delete().eq('slug', body.oldSlug);
      // Update any child subcategories pointing to oldSlug
      await supabaseAdmin
        .from('categories')
        .update({ parent_slug: body.slug, parent_id: cleanId })
        .eq('parent_slug', body.oldSlug);
    }

    const { data, error } = await supabaseAdmin.from('categories').upsert(row, { onConflict: 'slug' }).select().single();
    if (error) throw error;

    const { data: all } = await supabaseAdmin.from('categories').select('*').order('display_order').order('name');
    const categories = (all || []).map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));

    return NextResponse.json({ success: true, category: categoryFromDb(data), categories });
  } catch (error) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save category' }, { status: 500 });
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

    const results = await Promise.all(
      updates.map(({ slug, order }) =>
        supabaseAdmin.from('categories').update({ display_order: order }).eq('slug', slug)
      )
    );
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) throw firstError;

    const { data: all } = await supabaseAdmin.from('categories').select('*').order('display_order').order('name');
    const categories = (all || []).map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));

    return NextResponse.json({ success: true, categories });
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
      await supabaseAdmin
        .from('categories')
        .update({ parent_slug: null, parent_id: null })
        .eq('parent_slug', targetSlug);

      const { error } = await supabaseAdmin.from('categories').delete().eq('slug', targetSlug);
      if (error) throw error;
    } else if (id) {
      const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
      if (error) throw error;
    }

    const { data: all } = await supabaseAdmin.from('categories').select('*').order('display_order').order('name');
    const categories = (all || []).map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('DELETE /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
