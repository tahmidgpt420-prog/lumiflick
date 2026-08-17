import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import StorefrontShell from '@/components/StorefrontShell';
import TrackingScripts from '@/components/TrackingScripts';
import { getHeroBannersServer, getFirstBannerPreloadUrls } from '@/lib/heroBannersServer';

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
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'LUMIFLICK | Elegant Glass Poster',
    description: 'Museum-grade 2.5mm real glass frameless wall art with mirror-like HD finish and lifetime color guarantee.',
    url: 'https://lumiflick.shop',
    siteName: 'LUMIFLICK',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <head>
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
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased selection:bg-black selection:text-white">
        <TrackingScripts />
        <CartProvider>
          <ProductProvider>
            <StorefrontShell>{children}</StorefrontShell>
          </ProductProvider>
        </CartProvider>
      </body>
    </html>
  );
}
