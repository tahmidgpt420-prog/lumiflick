/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'genuinetask.com.bd' },
      { protocol: 'https', hostname: 'drive.google.com' },
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
