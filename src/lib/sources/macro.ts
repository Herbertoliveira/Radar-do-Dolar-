import axios from 'axios';

export type MacroSnapshot = {
	usRates?: number; // 10y yield
	usRatesDelta?: number; // variação diária
	brRates?: number; // Selic
	brRatesDelta?: number; // variação diária
	usPositive?: boolean;
	brPositive?: boolean;
	brlFlowNegative?: boolean; // fluxo cambial negativo
	exportsUp?: boolean;
	vixAbove20?: boolean;
} | null;

export async function getMacroSnapshot(): Promise<MacroSnapshot> {
	try {
		const [fredPair, bacenFlow, selicPair, exportsBr, teSent] = await Promise.all([
			getFredUS10YPair().catch(() => null),
			getBacenFlow().catch(() => null),
			getSelicPair().catch(() => null),
			getExportsBR().catch(() => null),
			getTESentiment().catch(() => null),
		]);

		const usRates = fredPair?.current;
		const usRatesDelta = typeof fredPair?.current === 'number' && typeof fredPair?.prev === 'number' ? fredPair.current - fredPair.prev : undefined;
		const brRates = selicPair?.current;
		const brRatesDelta = typeof selicPair?.current === 'number' && typeof selicPair?.prev === 'number' ? selicPair.current - selicPair.prev : undefined;
		const brlFlowNegative = typeof bacenFlow === 'number' ? bacenFlow < 0 : undefined;
		const exportsUp = typeof exportsBr === 'number' ? exportsBr > 0 : undefined; // variação mensal positiva

		const usPositive = teSent?.usPositive ?? false;
		const brPositive = teSent?.brPositive ?? false;

		return { usRates, usRatesDelta, brRates, brRatesDelta, brlFlowNegative, exportsUp, vixAbove20: false, usPositive, brPositive };
	} catch (e) {
		return null;
	}
}

async function getFredUS10YPair() {
	const apiKey = process.env.FRED_API_KEY;
	if (!apiKey) return null;
	const res = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
		params: { series_id: 'DGS10', api_key: apiKey, file_type: 'json', sort_order: 'desc', limit: 2 },
	});
	const obs = res.data?.observations ?? [];
	const current = Number(obs[0]?.value);
	const prev = Number(obs[1]?.value);
	return isFinite(current) && isFinite(prev) ? { current, prev } : null;
}

async function getBacenFlow() {
	// Bacen fluxo cambial semanal: SGS 24460 (Fluxo cambial total - semanal)
	const res = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.24460/dados/ultimos/1?formato=json');
	const val = res.data?.[0]?.valor;
	const num = Number(val);
	return isFinite(num) ? num : null;
}

async function getSelicPair() {
	// Bacen Selic meta: SGS 432 (Meta Selic - ao ano)
	const res = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/2?formato=json');
	const arr = res.data ?? [];
	const current = Number(arr[arr.length - 1]?.valor);
	const prev = Number(arr[arr.length - 2]?.valor);
	return isFinite(current) && isFinite(prev) ? { current, prev } : null;
}

async function getExportsBR() {
	// Exportações - Balança Comercial, variação mensal: exemplo SGS 28587 (Exportações - quantum, crescimento % m/m)
	try {
		const res = await axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.28587/dados/ultimos/1?formato=json');
		const val = res.data?.[0]?.valor;
		const num = Number(val);
		return isFinite(num) ? num : null;
	} catch {
		return null;
	}
}

async function getTESentiment() {
	const key = process.env.TRADINGECONOMICS_KEY;
	if (!key) return { usPositive: false, brPositive: false };
	try {
		const today = new Date().toISOString().slice(0, 10);
		const url = 'https://api.tradingeconomics.com/calendar';
		const { data } = await axios.get(url, {
			params: { d1: today, d2: today, c: 'Brazil,United States' },
			headers: { Authorization: `Client ${key}` },
		});
		let usScore = 0;
		let brScore = 0;
		for (const e of data ?? []) {
			const countryRaw = (e.Country || e.CountryCode || '').toString();
			const country = countryRaw.includes('United') ? 'US' : countryRaw.includes('Brazil') ? 'BR' : countryRaw;
			const actual = toNum(e.Actual || e.Last || e.Value);
			const forecast = toNum(e.Forecast);
			const importance = String(e.Importance || e.ImportanceLevel || '').toLowerCase();
			const weight = importance.includes('high') ? 2 : importance.includes('medium') ? 1 : 0.5;
			const name = (e.Event || e.EventName || '').toLowerCase();

			if (!isFinite(actual) || !isFinite(forecast)) continue;
			const delta = actual - forecast;

			const isInflation = /(cpi|ppi|inflation|ipc|ipca|ipca-15|core)/.test(name);
			const isUnempRate = /(unemployment|desemprego)/.test(name) && /rate|taxa/.test(name);
			const isActivity = /(gdp|pib|pmi|ism|industrial|produção|retail|vendas|payroll|nonfarm)/.test(name);
			const isRates = /(rate decision|interest rate|selic|fomc|copom)/.test(name);

			let good: boolean | null = null;
			if (isInflation) good = delta < 0; // inflação abaixo do esperado é positivo
			else if (isUnempRate) good = delta < 0; // desemprego abaixo do esperado é positivo
			else if (isActivity) good = delta > 0; // atividade acima do esperado é positivo
			else if (isRates) good = null; // ignorar na heurística de sentimento para evitar dupla contagem

			if (good === null) continue;
			const signed = good ? weight : -weight;
			if (country === 'US') usScore += signed;
			if (country === 'BR') brScore += signed;
		}
		return { usPositive: usScore > 0, brPositive: brScore > 0 };
	} catch {
		return { usPositive: false, brPositive: false };
	}
}

function toNum(x: any) {
	const n = Number(String(x).replace(/[^0-9+\-\.]/g, ''));
	return n;
}