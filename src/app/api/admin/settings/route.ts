import { NextResponse } from 'next/server';
import { execute, queryOne, toRow } from '@/lib/db';
import { settingsFromDb, settingsToDb } from '@/lib/dbMappers';

export const dynamic = 'force-dynamic';

// GET requires an admin session (enforced by middleware.ts) — the storefront
// used to read this unauthenticated but now hits /api/store-settings
// instead, a column-limited public route. This one stays admin-only and
// keeps selecting '*' since the settings form edits every field, including
// the two frame-effect images.
export async function GET() {
  try {
    const data = await queryOne('SELECT * FROM settings WHERE id = 1');
    if (!data) throw new Error('settings row missing');
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
    await execute('UPDATE settings SET ? WHERE id = 1', [toRow(row)]);
    const data = await queryOne('SELECT * FROM settings WHERE id = 1');
    return NextResponse.json({ success: true, settings: settingsFromDb(data) });
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
