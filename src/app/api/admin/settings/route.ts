import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { settingsFromDb, settingsToDb } from '@/lib/supabaseMappers';

export const dynamic = 'force-dynamic';

// GET is deliberately reachable without an admin session (see middleware.ts) —
// the public storefront calls it to load tracking scripts / store contact info.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return NextResponse.json({ success: true, settings: settingsFromDb(data) });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST requires an admin session — enforced by middleware.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const row = settingsToDb(body);
    const { data, error } = await supabaseAdmin.from('settings').update(row).eq('id', 1).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, settings: settingsFromDb(data) });
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
