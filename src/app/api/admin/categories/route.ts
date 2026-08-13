import { NextResponse } from 'next/server';
import { getAllCategories, saveCategory, deleteCategory, getDeletedCategorySlugs } from '@/data/db';
import {
  getAllCategoriesFromFirestore,
  getDeletedCategorySlugsFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
} from '@/lib/firestoreProducts';
import { ensureFirebaseAdminAuth } from '@/lib/firebaseAdminAuth';
import { categories as staticCategories } from '@/data/categories';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

/** Merge static seed, JSON store, and Firestore (Firestore wins on slug conflict). */
async function getMergedCategories(): Promise<Category[]> {
  const jsonCats = getAllCategories();
  const deletedSlugs = getDeletedCategorySlugs();
  let firestoreCats: Category[] = [];
  try {
    firestoreCats = await getAllCategoriesFromFirestore();
    const firestoreDeleted = await getDeletedCategorySlugsFromFirestore();
    firestoreDeleted.forEach((s) => deletedSlugs.add(s));
  } catch {
    // best-effort — fall through with whatever we have
  }

  const bySlug = new Map<string, Category>();
  staticCategories.forEach((c) => bySlug.set(c.slug, c));
  jsonCats.forEach((c) => bySlug.set(c.slug, c));
  firestoreCats.forEach((c) => bySlug.set(c.slug, c));

  return Array.from(bySlug.values()).filter((c) => !deletedSlugs.has(c.slug));
}

export async function GET() {
  try {
    const categories = await getMergedCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('GET /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ success: false, error: 'name and slug are required' }, { status: 400 });
    }

    const category: Category = {
      name: body.name,
      slug: body.slug,
      image: body.image || '/logo.png',
      description: body.description || '',
      parentSlug: body.parentSlug ?? null,
      parentId: body.parentId ?? null,
    };

    // 1. Reliable primary store
    const saved = saveCategory(category, body.oldSlug);

    // 2. Best-effort Firestore mirror
    try {
      await ensureFirebaseAdminAuth();
      await saveCategoryToFirestore(category, body.oldSlug);
    } catch (firestoreErr) {
      console.warn('Firestore category sync skipped:', (firestoreErr as Error).message);
    }

    const categories = await getMergedCategories();
    return NextResponse.json({ success: true, category: saved, categories });
  } catch (error) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    deleteCategory(slug);

    try {
      await ensureFirebaseAdminAuth();
      await deleteCategoryFromFirestore(slug);
    } catch (firestoreErr) {
      console.warn('Firestore category delete sync skipped:', (firestoreErr as Error).message);
    }

    const categories = await getMergedCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('DELETE /api/admin/categories error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
