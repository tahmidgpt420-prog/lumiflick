import { NextResponse } from 'next/server';
import { getStoreData, saveStoreData } from '@/data/db';

export const dynamic = 'force-dynamic';

// GET is deliberately reachable without an admin session (see middleware.ts) —
// the public storefront calls it to load tracking scripts / store contact info.
// Never include adminPin or anything else sensitive in this response.
export async function GET() {
  try {
    const store = getStoreData();
    const { adminPin: _adminPin, ...publicSettings } = store.settings;
    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST requires an admin session — enforced by middleware.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = getStoreData();
    store.settings = { ...store.settings, ...body };
    saveStoreData(store);
    const { adminPin: _adminPin, ...publicSettings } = store.settings;
    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
