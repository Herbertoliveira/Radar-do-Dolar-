import NodeCache from 'node-cache';
import axios from 'axios';
import { DateTime } from 'luxon';
import { apiLogger } from '@/lib/logger';
import { getNewsQueries, getQueryForLanguage, getAllLanguagesForCategory } from '@/lib/news-queries';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET(request: Request) {
	const logger = apiLogger.createRequestLogger('/api/news', 'GET');
	const url = new URL(request.url);
	const category = url.searchParams.get('category') || 'usd-brl';
	const language = (url.searchParams.get('lang') || 'pt') as 'pt' | 'en' | 'es';
	const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
	
	logger.logInfo({
		requestData: { category, language, pageSize },
		userAgent: request.headers.get('user-agent') || undefined,
		ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
	});

	const cacheKey = `news-${category}-${language}-${pageSize}`;
	const cached = cache.get(cacheKey);
	
	if (cached) {
		logger.logResponse(200, cached, true, 'cache');
		return Response.json(cached);
	}

	const apiKey = process.env.NEWS_API_KEY;
	let items: any[] = [];
	let apiProvider = 'none';
	
	if (apiKey) {
		try {
			const queryConfig = getQueryForLanguage(category, language);
			const query = queryConfig.query;
			
			logger.logInfo({
				requestData: { 
					query, 
					language: queryConfig.language,
					description: queryConfig.description,
					keywords: queryConfig.keywords
				},
				apiProvider: 'NewsAPI'
			});

			const res = await axios.get('https://newsapi.org/v2/everything', {
				params: {
					q: query,
					sortBy: 'publishedAt',
					language: queryConfig.language,
					apiKey,
					pageSize,
				},
			});

			items = res.data.articles.map((a: any) => ({
				title: a.title,
				description: a.description,
				publishedAt: a.publishedAt,
				source: a.source?.name,
				url: a.url,
				urlToImage: a.urlToImage,
				content: a.content,
				language: queryConfig.language,
				category: category,
				query: query,
			}));

			apiProvider = 'NewsAPI';
			
			logger.logInfo({
				requestData: { 
					totalResults: res.data.totalResults,
					status: res.data.status,
					articlesFound: items.length
				},
				apiProvider: 'NewsAPI'
			});

		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
			logger.logError(`NewsAPI error: ${errorMessage}`, {
				requestData: { category, language, pageSize },
				apiProvider: 'NewsAPI'
			});
			
			// Tentar fallback com outras linguagens se a principal falhar
			const allLanguages = getAllLanguagesForCategory(category);
			const fallbackLanguage = allLanguages.find(lang => lang !== language) || 'pt';
			
			if (fallbackLanguage !== language) {
				logger.logWarn({
					requestData: { 
						fallbackLanguage, 
						originalLanguage: language,
						reason: 'Primary language failed, trying fallback'
					},
					apiProvider: 'NewsAPI'
				});
				
				try {
					const fallbackConfig = getQueryForLanguage(category, fallbackLanguage);
					const fallbackRes = await axios.get('https://newsapi.org/v2/everything', {
						params: {
							q: fallbackConfig.query,
							sortBy: 'publishedAt',
							language: fallbackConfig.language,
							apiKey,
							pageSize,
						},
					});

					items = fallbackRes.data.articles.map((a: any) => ({
						title: a.title,
						description: a.description,
						publishedAt: a.publishedAt,
						source: a.source?.name,
						url: a.url,
						urlToImage: a.urlToImage,
						content: a.content,
						language: fallbackConfig.language,
						category: category,
						query: fallbackConfig.query,
						fallback: true,
						originalLanguage: language,
					}));

					apiProvider = 'NewsAPI (fallback)';
					
					logger.logInfo({
						requestData: { 
							fallbackLanguage,
							totalResults: fallbackRes.data.totalResults,
							articlesFound: items.length
						},
						apiProvider: 'NewsAPI (fallback)'
					});
					
				} catch (fallbackError: any) {
					const fallbackErrorMessage = fallbackError.response?.data?.message || fallbackError.message || 'Fallback failed';
					logger.logError(`NewsAPI fallback error: ${fallbackErrorMessage}`, {
						requestData: { category, fallbackLanguage },
						apiProvider: 'NewsAPI (fallback)'
					});
					items = [];
				}
			} else {
				items = [];
			}
		}
	}

	if (!items.length) {
		logger.logWarn({
			requestData: { category, language },
			reason: 'No articles found, using mock data'
		});
		
		// Fallback mock com dados multilíngues
		const mockData = {
			'pt': [
				{
					title: 'Placeholder: Mercado monitora USD/BRL à espera de dados de inflação',
					description: 'Análise técnica e fundamentalista do par USD/BRL',
					publishedAt: DateTime.now().minus({ minutes: 2 }).toISO(),
					source: 'Mock PT',
					url: '#',
					language: 'pt',
					category: category,
					query: 'mock query',
				},
				{
					title: 'Placeholder: Fluxo cambial pressiona o real em semana de agenda cheia',
					description: 'Impacto das decisões do Fed no mercado brasileiro',
					publishedAt: DateTime.now().minus({ minutes: 10 }).toISO(),
					source: 'Mock PT',
					url: '#',
					language: 'pt',
					category: category,
					query: 'mock query',
				},
			],
			'en': [
				{
					title: 'Placeholder: Market monitors USD/BRL awaiting inflation data',
					description: 'Technical and fundamental analysis of USD/BRL pair',
					publishedAt: DateTime.now().minus({ minutes: 2 }).toISO(),
					source: 'Mock EN',
					url: '#',
					language: 'en',
					category: category,
					query: 'mock query',
				},
				{
					title: 'Placeholder: Currency flow pressures real in busy agenda week',
					description: 'Impact of Fed decisions on Brazilian market',
					publishedAt: DateTime.now().minus({ minutes: 10 }).toISO(),
					source: 'Mock EN',
					url: '#',
					language: 'en',
					category: category,
					query: 'mock query',
				},
			],
			'es': [
				{
					title: 'Placeholder: Mercado monitorea USD/BRL esperando datos de inflación',
					description: 'Análisis técnico y fundamental del par USD/BRL',
					publishedAt: DateTime.now().minus({ minutes: 2 }).toISO(),
					source: 'Mock ES',
					url: '#',
					language: 'es',
					category: category,
					query: 'mock query',
				},
				{
					title: 'Placeholder: Flujo cambiario presiona al real en semana de agenda ocupada',
					description: 'Impacto de las decisiones de la Fed en el mercado brasileño',
					publishedAt: DateTime.now().minus({ minutes: 10 }).toISO(),
					source: 'Mock ES',
					url: '#',
					language: 'es',
					category: category,
					query: 'mock query',
				},
			]
		};

		items = mockData[language] || mockData['pt'];
		apiProvider = 'mock';
	}

	// Adicionar metadados da resposta
	const responseData = {
		items,
		metadata: {
			category,
			language,
			totalResults: items.length,
			query: getQueryForLanguage(category, language).query,
			description: getQueryForLanguage(category, language).description,
			keywords: getQueryForLanguage(category, language).keywords,
			timestamp: DateTime.now().toISO(),
			cacheKey,
			apiProvider,
		}
	};

	cache.set(cacheKey, responseData);
	
	logger.logResponse(200, responseData, false, apiProvider);
	return Response.json(responseData);
}