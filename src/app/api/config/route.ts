import { NextRequest } from 'next/server';
import { apiLogger } from '@/lib/logger';

const store: Record<string, string> = {};

export async function GET(request: NextRequest) {
	const logger = apiLogger.createRequestLogger('/api/config', 'GET');
	
	logger.logInfo({
		userAgent: request.headers.get('user-agent') || undefined,
		ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
	});

	const response = { keys: mask(store) };
	
	logger.logResponse(200, response, false, 'internal');
	return Response.json(response);
}

export async function POST(req: NextRequest) {
	const logger = apiLogger.createRequestLogger('/api/config', 'POST');
	
	logger.logInfo({
		userAgent: req.headers.get('user-agent') || undefined,
		ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
	});

	const body = await req.json().catch(() => ({}));
	const updatedKeys: string[] = [];
	
	for (const k of ['RAPIDAPI_KEY', 'ALPHA_VANTAGE_KEY', 'FRED_API_KEY', 'TRADINGECONOMICS_KEY', 'NEWS_API_KEY']) {
		if (typeof body[k] === 'string') {
			const oldValue = store[k];
			store[k] = body[k];
			process.env[k] = body[k];
			
			if (oldValue !== body[k]) {
				updatedKeys.push(k);
				logger.logInfo({
					requestData: { 
						key: k,
						oldValue: oldValue ? `${oldValue.slice(0, 4)}•••${oldValue.slice(-2)}` : 'none',
						newValue: `${body[k].slice(0, 4)}•••${body[k].slice(-2)}`,
						updated: true
					}
				});
			}
		}
	}

	const response = { 
		ok: true, 
		keys: mask(store),
		metadata: {
			timestamp: new Date().toISO(),
			keysUpdated: updatedKeys.length,
			totalKeys: Object.keys(store).length
		}
	};
	
	logger.logResponse(200, response, false, 'internal');
	return Response.json(response);
}

function mask(obj: Record<string, string>) {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(obj)) {
		out[k] = v ? `${v.slice(0, 4)}•••${v.slice(-2)}` : '';
	}
	return out;
}