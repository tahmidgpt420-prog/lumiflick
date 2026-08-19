import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import StorefrontShell from '@/components/StorefrontShell';
import TrackingScripts from '@/components/TrackingScripts';
import { getHeroBannersServer, getFirstBannerPreloadUrls } from '@/lib/heroBannersServer';
import { getTrackingScriptsServer } from '@/lib/trackingScriptsServer';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dmsans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lumiflick.shop'),
  title: 'LUMIFLICK | Elegant Glass Poster',
  description:
    'Discover premium handcrafted frameless glass posters, luxury Islamic calligraphy, automotive prints, and modern minimalist art with cash on delivery across Bangladesh.',
  keywords: [
    'lumiflick',
    'glass poster',
    'frameless glass wall art',
    'glass poster bangladesh',
    'lumiflick glass poster',
    'wall art khulna',
    'wall art dhaka',
    'islamic glass art',
    'porsche wall art',
    'home decor bangladesh',
  ],
  // No `icons` field here on purpose — src/app/icon.png, apple-icon.png,
  // and favicon.ico (Next's file-based convention) already generate the
  // correct <link rel="icon"> tags. Declaring both risks duplicate tags,
  // and file-based convention takes priority anyway.
  openGraph: {
    title: 'LUMIFLICK | Elegant Glass Poster',
    description: 'Museum-grade 2.5mm real glass frameless wall art with mirror-like HD finish and lifetime color guarantee.',
    url: 'https://lumiflick.shop',
    siteName: 'LUMIFLICK',
    images: [
      {
        // Actual file is 120x120 (checked with `sips`) — was declaring
        // 800x800, which didn't match reality.
        url: '/logo.png',
        width: 120,
        height: 120,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

// Organization structured data — Google's documented, reliable way to
// associate a brand logo with search results (more reliable than favicon
// heuristics alone: https://developers.google.com/search/docs/appearance/structured-data/logo).
// This was completely absent before; likely the main fix for the missing
// logo in search results. Logo is 120x120, just above Google's 112x112
// documented minimum — a higher-res source logo would improve this
// further if one becomes available.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LUMIFLICK',
  url: 'https://www.lumiflick.shop',
  logo: 'https://www.lumiflick.shop/logo.png',
  sameAs: ['https://www.facebook.com/LumiFlick'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detect admin routes so we never inject tracking pixels there.
  // middleware.ts sets the x-pathname header on every request.
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAdminRoute = pathname.startsWith('/jw8yenjnkanhr823');

  // Fetch banners server-side so the LCP image URL is available in the HTML.
  // This lets the browser discover and start downloading the hero image before
  // any JavaScript runs — the single most impactful fix for LCP.
  let lcpPreloadUrls: { mobile: string; desktop: string } | null = null;
  try {
    const banners = await getHeroBannersServer();
    lcpPreloadUrls = getFirstBannerPreloadUrls(banners);
  } catch {
    // Non-fatal — the HeroSlider will still fetch and render client-side
  }

  // Fetch tracking scripts server-side so GTM/Meta Pixel appear in the
  // initial HTML — not injected later by client JS. This is what Google's
  // tag detection tool checks for.
  const ssrScripts = isAdminRoute
    ? { headerScripts: '', bodyScripts: '', footerScripts: '' }
    : await getTrackingScriptsServer();

  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <head>
        {/* Organization structured data — see comment above organizationJsonLd. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* Preload the LCP hero image so the browser fetches it immediately,
            before React hydrates and the HeroSlider's useEffect fires. Two
            media-gated variants — matching HeroSlider's own isMobile check
            (innerWidth < 640) — so the preloaded URL always matches what the
            <img> actually requests. A single unconditional (mobile-sized)
            preload here previously left desktop's real LCP request
            undiscovered until React hydrated and rendered the <img> tag. */}
        {lcpPreloadUrls && (
          <>
            <link
              rel="preload"
              as="image"
              href={lcpPreloadUrls.mobile}
              fetchPriority="high"
              media="(max-width: 639px)"
            />
            <link
              rel="preload"
              as="image"
              href={lcpPreloadUrls.desktop}
              fetchPriority="high"
              media="(min-width: 640px)"
            />
          </>
        )}

        {/* SSR tracking scripts (GTM head snippet, Meta Pixel base, GA4).
            Rendered directly into the initial HTML so tag-detection tools
            (Google Tag Manager's "Test" button, Meta Events Manager, etc.)
            can find them without waiting for JavaScript to execute.
            Never injected on admin routes — isAdminRoute check above. */}
        {ssrScripts.headerScripts && (
          <div dangerouslySetInnerHTML={{ __html: ssrScripts.headerScripts }} />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased selection:bg-black selection:text-white">
        {/* SSR body-open scripts (GTM <noscript> iframe fallback).
            Same admin-isolation and initial-HTML rationale as headerScripts. */}
        {ssrScripts.bodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: ssrScripts.bodyScripts }} />
        )}

        {/* Client-side component handles live updates: when the admin saves
            new scripts the storefront picks them up without a redeploy. */}
        <TrackingScripts />
        <CartProvider>
          <ProductProvider>
            <StorefrontShell>{children}</StorefrontShell>
          </ProductProvider>
        </CartProvider>

        {/* SSR footer scripts (chat widgets, conversion tags). */}
        {ssrScripts.footerScripts && (
          <div dangerouslySetInnerHTML={{ __html: ssrScripts.footerScripts }} />
        )}
      </body>
    </html>
  );
}
