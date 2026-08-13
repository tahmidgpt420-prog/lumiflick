import { NextResponse } from 'next/server';
import { getAllBanners, saveBanner } from '@/data/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = getAllBanners();
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = saveBanner(body);
    return NextResponse.json({ success: true, banner: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
