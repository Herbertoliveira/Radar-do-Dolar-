type MarketSnapshot = {
	quotes: Record<string, number>;
	changes?: Record<string, number>;
	indicators?: Record<string, any>;
} | null;

type MacroSnapshot = {
	usRates?: number; // 10y yield
	usRatesDelta?: number;
	brRates?: number; // Selic
	brRatesDelta?: number;
	usPositive?: boolean;
	brPositive?: boolean;
	brlFlowNegative?: boolean; // fluxo cambial negativo
	exportsUp?: boolean;
	vixAbove20?: boolean;
} | null;

export function computeScore({ market, macro }: { market: MarketSnapshot; macro: MacroSnapshot }): {
	score: number;
	bias: 'Forte Compra' | 'Compra' | 'Neutro' | 'Venda' | 'Forte Venda';
	brief: string;
	factors: string[];
} {
	let score = 0;
	const factors: string[] = [];

	// DXY subindo → Compra (+2) — usar variação percentual se disponível; fallback por nível
	const dxy = market?.quotes?.['^DXY'];
	const dxyPct = market?.changes?.['^DXY'];
	if (typeof dxyPct === 'number' ? dxyPct > 0 : typeof dxy === 'number' && dxy > 102) {
		score += 2;
		factors.push('DXY em alta');
	}

	// Juros EUA subindo (US10Y) → Compra (+1.5) usando delta ou variação
	const us10y = market?.quotes?.['US10Y'] ?? macro?.usRates;
	const us10yPct = market?.changes?.['US10Y'];
	const us10yDelta = macro?.usRatesDelta;
	if (typeof us10yPct === 'number' ? us10yPct > 0 : typeof us10yDelta === 'number' ? us10yDelta > 0 : typeof us10y === 'number' && us10y > 4) {
		score += 1.5;
		factors.push('Juros EUA (10Y) em alta');
	}

	// Juros Brasil caindo (Selic) → Compra (+1.5) usando delta
	const brSelic = macro?.brRates;
	const brSelicDelta = macro?.brRatesDelta;
	if (typeof brSelicDelta === 'number' ? brSelicDelta < 0 : typeof brSelic === 'number' && brSelic < 10.5) {
		score += 1.5;
		factors.push('Juros Brasil em queda');
	}

	// VIX acima de 20 → Compra (+1)
	if (macro?.vixAbove20) {
		score += 1;
		factors.push('VIX acima de 20');
	}

	// Fluxo cambial negativo (Bacen) → Compra (+2)
	if (macro?.brlFlowNegative) {
		score += 2;
		factors.push('Fluxo cambial negativo');
	}

	// Dados positivos EUA → Compra (+1.5)
	if (macro?.usPositive) {
		score += 1.5;
		factors.push('Dados econômicos EUA positivos');
	}

	// Dados positivos Brasil → Venda (-1.5)
	if (macro?.brPositive) {
		score -= 1.5;
		factors.push('Dados econômicos Brasil positivos');
	}

	// Selic estável/subindo → Venda (-2) usando delta
	if (typeof brSelicDelta === 'number' ? brSelicDelta >= 0 : typeof brSelic === 'number' && brSelic >= 10.5) {
		score -= 2;
		factors.push('Selic estável/subindo');
	}

	// Exportações em alta → Venda (-1)
	if (macro?.exportsUp) {
		score -= 1;
		factors.push('Exportações em alta');
	}

	const bias = score >= 3 ? 'Forte Compra' : score <= -3 ? 'Forte Venda' : score >= -0.9 && score <= 0.9 ? 'Neutro' : score > 0 ? 'Compra' : 'Venda';
	const brief = describeBias(score, factors);
	return { score: Math.round(score * 10) / 10, bias, brief, factors };
}

function describeBias(score: number, factors: string[]): string {
	if (score >= 5) return 'Condições externas favorecem dólar forte contra o real.';
	if (score <= -5) return 'Cenário favorece real mais forte e dólar pressionado.';
	if (score > 0) return `Leve viés comprador: ${factors.slice(0, 2).join(', ') || 'sinais mistos'}.`;
	if (score < 0) return `Leve viés vendedor: ${factors.slice(0, 2).join(', ') || 'sinais mistos'}.`;
	return 'Viés neutro no momento.';
}