import axios from 'axios';
import NodeCache from 'node-cache';
import { apiLogger } from '@/lib/logger';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET(request: Request) {
	const logger = apiLogger.createRequestLogger('/api/market', 'GET');
	
	logger.logInfo({
		userAgent: request.headers.get('user-agent') || undefined,
		ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
	});

	const cacheKey = 'market-v1';
	const cached = cache.get(cacheKey);
	
	if (cached) {
		logger.logResponse(200, cached, true, 'cache');
		return Response.json(cached);
	}

	const rapidKey = process.env.RAPIDAPI_KEY;
	const alphaKey = process.env.ALPHA_VANTAGE_KEY;

	const symbols = ['USD/BRL=X', '^DXY', '^VIX', '^TNX', 'US10Y', 'CL=F', 'GC=F', '^BVSP', '^GSPC'];

	let quotes: Record<string, number> = {};
	let changes: Record<string, number> = {};
	let apiProviders: string[] = [];

	if (rapidKey) {
		try {
			logger.logInfo({
				requestData: { symbols, region: 'US' },
				apiProvider: 'Yahoo Finance (RapidAPI)'
			});

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
					quotes[q.symbol] = Number(q.regularMarketPrice ?? q?.regularMarketPreviousClose);
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
			
			apiProviders.push('Yahoo Finance (RapidAPI)');
			
			logger.logInfo({
				requestData: { 
					symbolsRequested: symbols.length,
					symbolsReceived: arr.length,
					quotesFound: Object.keys(quotes).length,
					changesFound: Object.keys(changes).length
				},
				apiProvider: 'Yahoo Finance (RapidAPI)'
			});

		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
			logger.logError(`Yahoo Finance API error: ${errorMessage}`, {
				requestData: { symbols, region: 'US' },
				apiProvider: 'Yahoo Finance (RapidAPI)'
			});
		}
	}

	if (!Object.keys(quotes).length) {
		logger.logWarn({
			reason: 'No quotes received from Yahoo Finance, using mock data'
		});
		
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
		
		apiProviders.push('mock');
	}

	// Alpha Vantage extra indicators (optional)
	let indicators: Record<string, any> = {};
	if (alphaKey) {
		try {
			logger.logInfo({
				requestData: { 
					function: 'CURRENCY_EXCHANGE_RATE', 
					from_currency: 'USD', 
					to_currency: 'BRL' 
				},
				apiProvider: 'Alpha Vantage'
			});

			const av = await axios.get('https://www.alphavantage.co/query', {
				params: { 
					function: 'CURRENCY_EXCHANGE_RATE', 
					from_currency: 'USD', 
					to_currency: 'BRL', 
					apikey: alphaKey 
				},
			});
			
			const rate = av.data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
			if (rate) {
				indicators['USD/BRL'] = Number(rate);
				apiProviders.push('Alpha Vantage');
				
				logger.logInfo({
					requestData: { 
						exchangeRate: rate,
						fromCurrency: 'USD',
						toCurrency: 'BRL'
					},
					apiProvider: 'Alpha Vantage'
				});
			} else {
				logger.logWarn({
					requestData: { responseData: av.data },
					reason: 'No exchange rate found in Alpha Vantage response',
					apiProvider: 'Alpha Vantage'
				});
			}
			
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
			logger.logError(`Alpha Vantage API error: ${errorMessage}`, {
				requestData: { 
					function: 'CURRENCY_EXCHANGE_RATE', 
					from_currency: 'USD', 
					to_currency: 'BRL' 
				},
				apiProvider: 'Alpha Vantage'
			});
		}
	}

	const body = { 
		quotes, 
		changes, 
		indicators,
		metadata: {
			timestamp: new Date().toISOString(),
			symbols: Object.keys(quotes),
			apiProviders,
			cacheKey,
			totalQuotes: Object.keys(quotes).length,
			totalChanges: Object.keys(changes).length,
			totalIndicators: Object.keys(indicators).length,
		}
	};
	
	cache.set(cacheKey, body);
	
	logger.logResponse(200, body, false, apiProviders.join(', '));
	return Response.json(body);
}