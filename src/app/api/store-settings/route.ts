import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/catalogServer';

// Public, unauthenticated (outside the /api/admin/* middleware matcher by
// design). Column-limited: the two large frame-effect images are served by
// /api/store-settings/frame, only on the homepage.
export async function GET() {
  try {
    return NextResponse.json({ success: true, settings: await getStoreSettings() });
  } catch (error) {
    console.error('GET /api/store-settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}
