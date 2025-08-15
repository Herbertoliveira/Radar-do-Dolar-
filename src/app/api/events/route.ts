import NodeCache from 'node-cache';
import axios from 'axios';
import { DateTime } from 'luxon';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET() {
	const cacheKey = 'events-v1';
	const cached = cache.get(cacheKey);
	if (cached) return Response.json(cached);

	const teKey = process.env.TRADINGECONOMICS_KEY; // format: user:pass OR api_key
	let items: any[] = [];
	const today = DateTime.now().setZone('America/Sao_Paulo').toISODate();
	if (teKey) {
		try {
			const res = await axios.get('https://api.tradingeconomics.com/calendar', {
				params: { d1: today, d2: today, c: 'Brazil,United States' },
				paramsSerializer: {
					serialize: (params) => new URLSearchParams(params as any).toString(),
				},
				headers: { Authorization: `Client ${teKey}` },
			});
			items = (res.data ?? []).map((e: any) => ({
				name: e.Event || e.EventName || 'Evento',
				when: DateTime.fromISO(e.Date || e.DateUTC || e.CalendarId || new Date().toISOString()).toISO(),
				country: e.Country || e.CountryCode,
				importance: (e.Importance || '').toLowerCase(),
			}));
		} catch (e) {
			items = [];
		}
	}

	if (!items.length) {
		items = [
			{
				name: 'Placeholder: Coletiva BC (exemplo)',
				when: DateTime.now().setZone('America/Sao_Paulo').plus({ hours: 1 }).toISO(),
				country: 'BR',
				importance: 'medium',
			},
			{
				name: 'Placeholder: Payroll EUA (exemplo)',
				when: DateTime.now().setZone('America/Sao_Paulo').plus({ hours: 3 }).toISO(),
				country: 'US',
				importance: 'high',
			},
		];
	}

	cache.set(cacheKey, items);
	return Response.json(items);
}