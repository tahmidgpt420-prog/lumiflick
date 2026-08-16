import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { productFromDb, categoryFromDb } from '@/lib/supabaseMappers';
import { products as fallbackProducts } from '@/data/products';
import { categories as fallbackCategories } from '@/data/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lumiflick.shop';
  const currentDate = new Date();

  // Static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/raw-photos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/return-refund-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch live products and categories from database
  let productsList = fallbackProducts;
  let categoriesList = fallbackCategories;

  try {
    const [{ data: productRows, error: pErr }, { data: categoryRows, error: cErr }] = await Promise.all([
      supabaseAdmin.from('products').select('*'),
      supabaseAdmin.from('categories').select('*'),
    ]);

    if (!pErr && productRows && productRows.length > 0) {
      productsList = productRows.map(productFromDb);
    }
    if (!cErr && categoryRows && categoryRows.length > 0) {
      categoriesList = categoryRows.map(categoryFromDb);
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap from database:', err);
  }

  // Live Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categoriesList
    .filter((cat) => Boolean(cat.slug))
    .map((cat) => ({
      url: `${baseUrl}/product-category/${encodeURIComponent(cat.slug)}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    }));

  // Live Product routes
  const productRoutes: MetadataRoute.Sitemap = productsList
    .filter((prod) => Boolean(prod.slug))
    .map((prod) => ({
      url: `${baseUrl}/product/${encodeURIComponent(prod.slug)}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
