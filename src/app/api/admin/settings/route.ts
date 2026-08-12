import { NextResponse } from 'next/server';
import { getStoreData, saveStoreData } from '@/data/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getStoreData();
    return NextResponse.json({ success: true, settings: store.settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = getStoreData();
    store.settings = { ...store.settings, ...body };
    saveStoreData(store);
    return NextResponse.json({ success: true, settings: store.settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
