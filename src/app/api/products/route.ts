import { NextRequest, NextResponse } from 'next/server';
import { getProductsPage } from '@/lib/catalogServer';

// Public, unauthenticated. Paginated + filtered + sorted product listing,
// used for client-side "load more", sort/category switching and search.
// The first page of each listing is rendered on the server instead.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const page = await getProductsPage({
      category: params.get('category') || undefined,
      sort: params.get('sort') || undefined,
      q: params.get('q') || undefined,
      offset: Number(params.get('offset')) || 0,
      limit: Number(params.get('limit')) || undefined,
    });
    return NextResponse.json({ success: true, ...page });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load products' }, { status: 500 });
  }
}
