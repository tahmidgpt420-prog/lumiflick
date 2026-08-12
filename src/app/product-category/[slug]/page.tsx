import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { categories, getCategoryBySlug } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import ProductCard from '@/components/ProductCard';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found | GenuineTask',
    };
  }

  return {
    title: `${category.name} | GenuineTask Wall Art Collections`,
    description: category.description || `Browse the best ${category.name} handcrafted wall frames in Bangladesh. Cash on delivery available.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.slug);

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">
          Collections
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {category.description}
          </p>
        )}
        <p className="text-xs text-gray-400 font-medium">
          Showing {categoryProducts.length} premium frame designs
        </p>
      </div>

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-600 font-medium text-sm">
            New designs coming soon to this collection!
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800"
          >
            Explore Other Collections
          </Link>
        </div>
      )}
    </div>
  );
}
