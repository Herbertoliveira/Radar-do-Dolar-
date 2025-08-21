import NodeCache from 'node-cache';
import axios from 'axios';
import { DateTime } from 'luxon';
import { apiLogger } from '@/lib/logger';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET(request: Request) {
	const logger = apiLogger.createRequestLogger('/api/events', 'GET');
	
	logger.logInfo({
		userAgent: request.headers.get('user-agent') || undefined,
		ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
	});

	const cacheKey = 'events-v1';
	const cached = cache.get(cacheKey);
	
	if (cached) {
		logger.logResponse(200, cached, true, 'cache');
		return Response.json(cached);
	}

	const teKey = process.env.TRADINGECONOMICS_KEY; // format: user:pass OR api_key
	let items: any[] = [];
	let apiProvider = 'none';
	const today = DateTime.now().setZone('America/Sao_Paulo').toISODate();
	
	if (teKey) {
		try {
			logger.logInfo({
				requestData: { 
					date: today, 
					countries: 'Brazil,United States',
					timezone: 'America/Sao_Paulo'
				},
				apiProvider: 'Trading Economics'
			});

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
			
			apiProvider = 'Trading Economics';
			
			logger.logInfo({
				requestData: { 
					totalEvents: res.data?.length || 0,
					eventsProcessed: items.length,
					date: today,
					countries: 'Brazil,United States'
				},
				apiProvider: 'Trading Economics'
			});

		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
			logger.logError(`Trading Economics API error: ${errorMessage}`, {
				requestData: { date: today, countries: 'Brazil,United States' },
				apiProvider: 'Trading Economics'
			});
			items = [];
		}
	}

	if (!items.length) {
		logger.logWarn({
			reason: 'No events found, using mock data'
		});
		
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
		
		apiProvider = 'mock';
	}

	const responseData = {
		items,
		metadata: {
			timestamp: DateTime.now().toISO(),
			date: today,
			totalEvents: items.length,
			apiProvider,
			cacheKey,
			countries: ['BR', 'US'],
			timezone: 'America/Sao_Paulo',
		}
	};

	cache.set(cacheKey, responseData);
	
	logger.logResponse(200, responseData, false, apiProvider);
	return Response.json(responseData);
}