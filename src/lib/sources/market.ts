import axios from 'axios';

export type MarketSnapshot = {
	quotes: Record<string, number>;
	changes?: Record<string, number>;
	indicators?: Record<string, any>;
};

export async function getMarketSnapshot(): Promise<MarketSnapshot | null> {
	try {
		const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
		const { data } = await axios.get(`${base}/api/market`);
		return data as MarketSnapshot;
	} catch (e) {
		return null;
	}
}