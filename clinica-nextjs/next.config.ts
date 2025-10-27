import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	async rewrites() {
		return [
			{
				source: '/chat/:path*',
				destination: `${process.env.NEXT_PUBLIC_CHAT_API_BASE_URL}/:path*`,
			},
			{
				source: '/api/:path*',
				destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
				//destination: 'http://localhost:3001/:path*',
			},
		];
	},
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
	experimental: {
		serverActions: {
			bodySizeLimit: '6mb',
		}
	}
};

export default nextConfig;

