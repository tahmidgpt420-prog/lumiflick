import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { orderFromDb, orderToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, orders: (data || []).map(orderFromDb) });
  } catch (error) {
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const row = orderToDb(body);
    const { data, error } = await supabaseAdmin.from('orders').insert(row).select().single();
    if (error) throw error;
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
    const { error, count } = await supabaseAdmin.from('orders').update({ status }, { count: 'exact' }).eq('order_id', orderId);
    if (error) throw error;
    return NextResponse.json({ success: Boolean(count) });
  } catch (error) {
    console.error('PUT /api/admin/orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
