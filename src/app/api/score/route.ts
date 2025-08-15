import { NextRequest } from 'next/server';
import { DateTime } from 'luxon';
import NodeCache from 'node-cache';
import { z } from 'zod';
import { computeScore } from '@/lib/score-engine';
import { getMarketSnapshot } from '@/lib/sources/market';
import { getMacroSnapshot } from '@/lib/sources/macro';
import { promises as fs } from 'fs';
import path from 'path';

const cache = new NodeCache({ stdTTL: 60 });

export async function GET(_req: NextRequest) {
	const cacheKey = 'score-v1';
	const cached = cache.get(cacheKey);
	if (cached) {
		return Response.json(cached);
	}

	const today = DateTime.now().setZone('America/Sao_Paulo').startOf('day');

	const [market, macroBase] = await Promise.all([
		getMarketSnapshot().catch(() => null),
		getMacroSnapshot().catch(() => null),
	]);

	const vixQuote = market?.quotes?.['^VIX'];
	const macro = { ...macroBase, vixAbove20: typeof vixQuote === 'number' ? vixQuote > 20 : macroBase?.vixAbove20 };

	const { score, bias, brief, factors } = computeScore({ market, macro });

	const todayIso = today.toISODate()!;
	let history = await loadPersistedHistory().catch(() => [] as ScoreEntry[]);

	if (!history.length) {
		// inicializa histórico com placeholders a partir do score atual
		history = buildHistory(score, bias, brief, factors, todayIso);
	}

	history = mergeHistory(history, { date: todayIso, score, label: todayIso, bias, brief, factors });
	await savePersistedHistory(history);

	const body = { today: history[history.length - 1], history };
	cache.set(cacheKey, body);
	return Response.json(body);
}

type ScoreEntry = {
	date: string;
	score: number;
	label: string;
	bias: 'Forte Compra' | 'Compra' | 'Neutro' | 'Venda' | 'Forte Venda';
	brief: string;
	factors: string[];
};

const DATA_DIR = path.join(process.cwd(), '.data');
const HISTORY_PATH = path.join(DATA_DIR, 'history.json');

async function loadPersistedHistory(): Promise<ScoreEntry[]> {
	try {
		const raw = await fs.readFile(HISTORY_PATH, 'utf-8');
		const arr = JSON.parse(raw) as ScoreEntry[];
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

async function savePersistedHistory(history: ScoreEntry[]): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
	await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

function mergeHistory(history: ScoreEntry[], todayEntry: ScoreEntry): ScoreEntry[] {
	const map = new Map<string, ScoreEntry>();
	for (const h of history) map.set(h.date, h);
	map.set(todayEntry.date, todayEntry);
	const merged = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
	const last30 = merged.slice(Math.max(0, merged.length - 30));
	return last30;
}

function buildHistory(
	score: number,
	bias: 'Forte Compra' | 'Compra' | 'Neutro' | 'Venda' | 'Forte Venda',
	brief: string,
	factors: string[],
	todayIso: string
) {
	const days = 30;
	const result = Array.from({ length: days }).map((_, i) => {
		const date = DateTime.fromISO(todayIso).minus({ days: days - 1 - i }).toISODate()!;
		const noisy = score + (Math.random() - 0.5) * 2; // pequeno ruído para histórico placeholder
		return {
			date,
			score: Math.round(noisy * 10) / 10,
			label: date,
			bias,
			brief,
			factors,
		};
	});
	return result as ScoreEntry[];
}