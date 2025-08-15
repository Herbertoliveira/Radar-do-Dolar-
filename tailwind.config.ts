import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/app/**/*.{ts,tsx}',
		'./src/components/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					bg: '#f5f5f5',
					green: '#2ecc71',
					red: '#e74c3c',
					gray: '#7f8c8d'
				}
			}
		}
	},
	plugins: [],
};

export default config;