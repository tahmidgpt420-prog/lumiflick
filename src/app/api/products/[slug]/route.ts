import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/catalogServer';

// Public, unauthenticated. Full row for exactly one product.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const raw = decodeURIComponent(slug || '').trim();
  if (!raw) {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  }

  try {
    const product = await getProductBySlug(raw);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product' }, { status: 500 });
  }
}
