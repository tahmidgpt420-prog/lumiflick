import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import StorefrontShell from '@/components/StorefrontShell';

export const metadata: Metadata = {
  title: 'GenuineTask | Premium Handcrafted Wall Art & Frames in Bangladesh',
  description:
    'Discover premium handcrafted wall frames, religious calligraphy sets, automotive supercars prints, and modern minimalist art with cash on delivery across Bangladesh.',
  keywords: [
    'wall frame',
    'genuine task',
    'photo frame bangladesh',
    'wall art dhaka',
    'calligraphy frame',
    'porsche wall art',
    'home decor bangladesh',
  ],
  openGraph: {
    title: 'GenuineTask | Premium Wall Frames & Art',
    description: 'Museum grade textured matte wall art and handcrafted wooden frames.',
    url: 'https://genuinetask.com.bd',
    siteName: 'GenuineTask',
    images: [
      {
        url: 'https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg',
        width: 800,
        height: 600,
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
        <CartProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </CartProvider>
      </body>
    </html>
  );
}
