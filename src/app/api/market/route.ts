import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET() {
	const cacheKey = 'market-v1';
	const cached = cache.get(cacheKey);
	if (cached) return Response.json(cached);

	const rapidKey = process.env.RAPIDAPI_KEY;
	const alphaKey = process.env.ALPHA_VANTAGE_KEY;

	const symbols = ['USD/BRL=X', '^DXY', '^VIX', '^TNX', 'US10Y', 'CL=F', 'GC=F', '^BVSP', '^GSPC'];

	let quotes: Record<string, number> = {};
	let changes: Record<string, number> = {};

	if (rapidKey) {
		try {
			const res = await axios.get('https://yh-finance.p.rapidapi.com/market/v2/get-quotes', {
				params: { region: 'US', symbols: symbols.join(',') },
				headers: {
					'x-rapidapi-host': 'yh-finance.p.rapidapi.com',
					'x-rapidapi-key': rapidKey,
				},
			});
			const arr = res.data?.quoteResponse?.result ?? [];
			for (const q of arr) {
				if (q?.symbol && (q?.regularMarketPrice ?? q?.regularMarketPreviousClose)) {
					quotes[q.symbol] = Number(q.regularMarketPrice ?? q.regularMarketPreviousClose);
					if (typeof q.regularMarketChangePercent === 'number') {
						changes[q.symbol] = Number(q.regularMarketChangePercent);
					}
				}
			}
			// Converter ^TNX em US10Y (yield em % = ^TNX/10)
			if (quotes['^TNX']) {
				quotes['US10Y'] = Number((quotes['^TNX'] / 10).toFixed(2));
				if (typeof changes['^TNX'] === 'number') {
					changes['US10Y'] = Number(changes['^TNX']);
				}
			}
		} catch (e) {}
	}

	if (!Object.keys(quotes).length) {
		// fallback mocks
		quotes = {
			'USD/BRL=X': 5.35,
			'^DXY': 103.2,
			'^VIX': 17.5,
			'US10Y': 4.25,
			'CL=F': 78.1,
			'GC=F': 2350,
			'^BVSP': 128000,
			'^GSPC': 5230,
		};
		changes = {
			'^DXY': 0.2,
			'^VIX': -1.1,
			'US10Y': 0.1,
		};
	}

	// Alpha Vantage extra indicators (optional)
	let indicators: Record<string, any> = {};
	if (alphaKey) {
		try {
			const av = await axios.get('https://www.alphavantage.co/query', {
				params: { function: 'CURRENCY_EXCHANGE_RATE', from_currency: 'USD', to_currency: 'BRL', apikey: alphaKey },
			});
			const rate = av.data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
			if (rate) indicators['USD/BRL'] = Number(rate);
		} catch (e) {}
	}

	const body = { quotes, changes, indicators };
	cache.set(cacheKey, body);
	return Response.json(body);
}