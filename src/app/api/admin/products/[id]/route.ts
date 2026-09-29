import { NextResponse } from 'next/server';
import { execute, queryOne, toRow } from '@/lib/db';
import { productFromDb, productToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const data = await queryOne('SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1', [params.id, params.id]);
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
    const matched = await execute('UPDATE products SET ? WHERE id = ? OR slug = ?', [toRow(row), params.id, params.id]);
    const data = matched ? await queryOne('SELECT * FROM products WHERE id = ?', [params.id]) : null;
    if (!data) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: productFromDb(data) });
  } catch (error) {
    console.error('PUT /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const count = await execute('DELETE FROM products WHERE id = ? OR slug = ?', [params.id, params.id]);
    if (!count) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
