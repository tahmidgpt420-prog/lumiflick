import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, productToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .or(`id.eq.${params.id},slug.eq.${params.id}`)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: productFromDb(data) });
  } catch (error) {
    console.error('GET /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const row = productToDb({ ...body, id: params.id });
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(row)
      .or(`id.eq.${params.id},slug.eq.${params.id}`)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: productFromDb(data) });
  } catch (error) {
    console.error('PUT /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { error, count } = await supabaseAdmin
      .from('products')
      .delete({ count: 'exact' })
      .or(`id.eq.${params.id},slug.eq.${params.id}`);
    if (error) throw error;
    if (!count) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
