import NodeCache from 'node-cache';
import axios from 'axios';
import { DateTime } from 'luxon';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET() {
	const cacheKey = 'news-v1';
	const cached = cache.get(cacheKey);
	if (cached) return Response.json(cached);

	const apiKey = process.env.NEWS_API_KEY;
	let items: any[] = [];
	if (apiKey) {
		try {
			const res = await axios.get('https://newsapi.org/v2/everything', {
				params: {
					q: '(USD OR dólar) AND (Brasil OR BRL OR real OR economia)',
					sortBy: 'publishedAt',
					language: 'pt',
					apiKey,
					pageSize: 20,
				},
			});
			items = res.data.articles.map((a: any) => ({
				title: a.title,
				publishedAt: a.publishedAt,
				source: a.source?.name,
				url: a.url,
			}));
		} catch (e) {
			items = [];
		}
	}

	if (!items.length) {
		// fallback mock
		items = [
			{
				title: 'Placeholder: Mercado monitora USD/BRL à espera de dados de inflação',
				publishedAt: DateTime.now().minus({ minutes: 2 }).toISO(),
				source: 'Mock',
				url: '#',
			},
			{
				title: 'Placeholder: Fluxo cambial pressiona o real em semana de agenda cheia',
				publishedAt: DateTime.now().minus({ minutes: 10 }).toISO(),
				source: 'Mock',
				url: '#',
			},
		];
	}

	cache.set(cacheKey, items);
	return Response.json(items);
}