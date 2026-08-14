import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import StorefrontShell from '@/components/StorefrontShell';
import TrackingScripts from '@/components/TrackingScripts';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lumiflick.shop'),
  title: 'LUMIFLICK | Premium Handcrafted Wall Art & Frames in Bangladesh',
  description:
    'Discover premium handcrafted wall frames, religious calligraphy sets, automotive supercar prints, and modern minimalist art with cash on delivery across Bangladesh.',
  keywords: [
    'lumiflick',
    'wall frame',
    'photo frame bangladesh',
    'wall art dhaka',
    'calligraphy frame',
    'porsche wall art',
    'home decor bangladesh',
    'lumiflick frames',
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'LUMIFLICK | Premium Wall Frames & Art',
    description: 'Museum grade textured matte wall art and handcrafted wooden frames.',
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
    <html lang="en">
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
