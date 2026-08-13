import { NextResponse } from 'next/server';
import { getAllReviews, saveReview } from '@/data/db';

export const dynamic = 'force-dynamic';

// GET is public (see middleware.ts) — the storefront's /reviews page reads it.
export async function GET() {
  try {
    const reviews = getAllReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('GET /api/admin/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 });
  }
}

// POST requires an admin session — enforced by middleware.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = saveReview(body);
    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 500 });
  }
}
