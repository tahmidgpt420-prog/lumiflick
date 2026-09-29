/** @type {import('next').NextConfig} */
const nextConfig = {
  // mysql2 is a native-Node driver — load it with a real require() at
  // runtime instead of webpack-bundling it into route handlers.
  serverExternalPackages: ['mysql2'],
  images: {
    // Drive's thumbnail endpoint does the resizing (see src/lib/imageLoader.ts),
    // so next/image emits a srcset of Drive URLs instead of running Next's own
    // optimizer on this server. Widths cover product cards (320-640 px) and
    // full-width banners (up to 1920 px).
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384, 480],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'dropbox.com' },
      { protocol: 'https', hostname: 'www.dropbox.com' },
      { protocol: 'https', hostname: 'dl.dropboxusercontent.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'lumiflick-50f06.firebasestorage.app' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
