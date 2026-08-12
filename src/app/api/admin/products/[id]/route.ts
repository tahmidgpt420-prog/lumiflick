import { NextResponse } from 'next/server';
import { getProductByIdOrSlug, saveProduct, deleteProduct } from '@/data/db';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const product = getProductByIdOrSlug(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const updated = saveProduct({ ...body, id: params.id });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const success = deleteProduct(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found or failed to delete' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
