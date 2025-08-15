import { NextRequest } from 'next/server';

const store: Record<string, string> = {};

export async function GET() {
	return Response.json({ keys: mask(store) });
}

export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => ({}));
	for (const k of ['RAPIDAPI_KEY', 'ALPHA_VANTAGE_KEY', 'FRED_API_KEY', 'TRADINGECONOMICS_KEY', 'NEWS_API_KEY']) {
		if (typeof body[k] === 'string') {
			store[k] = body[k];
			process.env[k] = body[k];
		}
	}
	return Response.json({ ok: true, keys: mask(store) });
}

function mask(obj: Record<string, string>) {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(obj)) {
		out[k] = v ? `${v.slice(0, 4)}•••${v.slice(-2)}` : '';
	}
	return out;
}