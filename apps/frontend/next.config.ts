import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: "/api/:path*", // match any route that starts with /api
				destination: "http://localhost:4000/api/:path*", // proxy to your backend API
			},
		];
	},
	// ...other config options
};

export default nextConfig;
