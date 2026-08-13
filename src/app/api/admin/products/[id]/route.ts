import { NextResponse } from 'next/server';
import { getProductByIdOrSlug, saveProduct, deleteProduct } from '@/data/db';
import { saveProductToFirestore, deleteProductFromFirestore } from '@/lib/firestoreProducts';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';

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
  } catch (error) {
    console.error('GET /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const body = await request.json();
    const updated = saveProduct({ ...body, id: params.id });

    try {
      await ensureFirebaseAdminAuth();
      await saveProductToFirestore(updated);
    } catch (firestoreErr) {
      console.warn('Firestore product sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('PUT /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const success = deleteProduct(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found or failed to delete' }, { status: 404 });
    }

    try {
      await ensureFirebaseAdminAuth();
      await deleteProductFromFirestore(params.id);
    } catch (firestoreErr) {
      console.warn('Firestore product delete sync skipped:', (firestoreErr as Error).message);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
