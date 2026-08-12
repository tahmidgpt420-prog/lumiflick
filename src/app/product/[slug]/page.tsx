import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts } from '@/data/products';
import ProductDetailView from '@/components/ProductDetailView';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | LUMIFLICK',
    };
  }

  return {
    title: `${product.title} | LUMIFLICK Bangladesh`,
    description:
      product.shortDescription ||
      `Buy ${product.title} premium wall frame in Bangladesh. High quality matte finish with Cash on delivery.`,
    openGraph: {
      title: `${product.title} | LUMIFLICK`,
      description: product.shortDescription,
      images: [
        {
          url: product.image,
          width: 600,
          height: 600,
          alt: product.title,
        },
      ],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(
    product.slug,
    product.categorySlug || 'best-selling',
    4
  );

  return (
    <div className="bg-white">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
