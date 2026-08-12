import { NextResponse } from 'next/server';
import { getAllReviews, saveReview } from '@/data/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = getAllReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = saveReview(body);
    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
