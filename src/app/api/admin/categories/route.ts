import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { categoryFromDb, categoryToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

const RESERVED_SLUGS = new Set(['best-selling']);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('categories').select('*').order('name');
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

    const row = categoryToDb(body);

    // Rename: slug is the primary key, so a rename is delete-old + insert-new.
    if (body.oldSlug && body.oldSlug !== body.slug) {
      await supabaseAdmin.from('categories').delete().eq('slug', body.oldSlug);
    }

    const { data, error } = await supabaseAdmin.from('categories').upsert(row, { onConflict: 'slug' }).select().single();
    if (error) throw error;

    const { data: all } = await supabaseAdmin.from('categories').select('*').order('name');
    const categories = (all || []).map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));

    return NextResponse.json({ success: true, category: categoryFromDb(data), categories });
  } catch (error) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('slug', slug);
    if (error) throw error;

    const { data: all } = await supabaseAdmin.from('categories').select('*').order('name');
    const categories = (all || []).map(categoryFromDb).filter((c) => !RESERVED_SLUGS.has(c.slug));

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('DELETE /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
