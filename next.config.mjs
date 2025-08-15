/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		typedRoutes: true
	},
	headers: async () => {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Timezone', value: 'America/Sao_Paulo' }
				]
			}
		];
	}
};

export default nextConfig;