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
    hostname: '*.r2.dev',
    port: '',
    pathname: '/**',
  },
],
  },
}