/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'xwfazcaxniogiyyaovau.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/home', destination: '/' },
      { source: '/explore', destination: '/' },
      { source: '/tryon', destination: '/' },
      { source: '/try-on', destination: '/' },
      { source: '/upload', destination: '/' },
      { source: '/ai-create', destination: '/' },
      { source: '/create', destination: '/' },
      { source: '/favorites', destination: '/' },
      { source: '/history', destination: '/' },
      { source: '/passport', destination: '/' },
      { source: '/profile', destination: '/' },
      { source: '/onboarding', destination: '/' },
    ];
  },
};

export default nextConfig;
