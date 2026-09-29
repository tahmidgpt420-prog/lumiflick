import { NextResponse } from 'next/server';
import { execute, query, queryOne, toRow } from '@/lib/db';
import { orderFromDb, orderToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json({ success: true, orders: rows.map(orderFromDb) });
  } catch (error) {
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const row = orderToDb(body);
    await execute('INSERT INTO orders SET ?', [toRow(row)]);
    const data = await queryOne('SELECT * FROM orders WHERE order_id = ?', [row.order_id]);
    return NextResponse.json({ success: true, order: orderFromDb(data) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'orderId and status are required' }, { status: 400 });
    }
    const count = await execute('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
    return NextResponse.json({ success: Boolean(count) });
  } catch (error) {
    console.error('PUT /api/admin/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
