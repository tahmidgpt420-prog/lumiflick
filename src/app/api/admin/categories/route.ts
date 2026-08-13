import { NextResponse } from 'next/server';
import {
  getAllCategoriesFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
} from '@/lib/firestoreProducts';
import { categories as staticCategories } from '@/data/categories';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

/** Merge Firestore categories with static fallback (Firestore wins on slug conflict) */
async function getMergedCategories(): Promise<Category[]> {
  const firestoreCats = await getAllCategoriesFromFirestore();

  if (firestoreCats.length > 0) {
    // Firestore slugs take priority
    const firestoreSlugs = new Set(firestoreCats.map((c) => c.slug));
    const staticOnly = staticCategories.filter((c) => !firestoreSlugs.has(c.slug));
    return [...firestoreCats, ...staticOnly];
  }

  // No Firestore categories yet — return static as fallback
  return staticCategories;
}

export async function GET() {
  try {
    const categories = await getMergedCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category: Category = {
      name: body.name,
      slug: body.slug,
      image: body.image || '/logo.png',
      description: body.description || '',
    };

    await saveCategoryToFirestore(category);
    const categories = await getMergedCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }
    await deleteCategoryFromFirestore(slug);
    const categories = await getMergedCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
