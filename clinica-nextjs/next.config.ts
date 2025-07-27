import type { NextConfig } from "next";

const nextConfig: NextConfig = {

};

export default nextConfig;

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://clinica-api:42069/api/:path*',
      },
    ];
  },
};

module.exports = {
  images: {
    remotePatterns: [
  {
    protocol: 'https',
    hostname: 'pub-ea02a55403d04609aeb9b3b618e1c834.r2.dev',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'img.clerk.com',
    port: '',
    pathname: '/**',
  },
],
  },
}