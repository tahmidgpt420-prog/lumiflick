import type { Metadata } from 'next';
import { Outfit, DM_Sans, Cinzel } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import StorefrontShell from '@/components/StorefrontShell';
import TrackingScripts from '@/components/TrackingScripts';

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

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${cinzel.variable}`}>
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
