import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;

module.exports = {
	async rewrites() {
		return [
			{
				source: '/api/chat/:path*',
				destination: 'http://chat-clinica-api.stackkub.com/api/:path*',
			},
			{
				source: '/api/:path*',
				//destination: 'https://clinica-api.stackkub.com:3001/:path*',
				destination: 'http://localhost:3001/:path*',
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

};

