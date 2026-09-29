import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/catalogServer';

export const dynamic = 'force-dynamic';

// Public, unauthenticated. The whole categories table (small). Pages get
// categories from the root layout; this serves the admin "refresh" path.
export async function GET() {
  try {
    return NextResponse.json({ success: true, categories: await getCategories() });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories' }, { status: 500 });
  }
}
