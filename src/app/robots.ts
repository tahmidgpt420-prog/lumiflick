import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lumiflick.shop';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/jw8yenjnkanhr823',
          '/jw8yenjnkanhr823/*',
          '/api/*',
          '/cart',
          '/checkout',
          '/order-success/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
