"use client";

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { DateTime } from 'luxon';
import { Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ScoreEntry = {
	date: string;
	score: number;
	label: string;
	bias: 'Forte Compra' | 'Compra' | 'Neutro' | 'Venda' | 'Forte Venda';
	brief: string;
};

type NewsItem = {
	title: string;
	publishedAt: string;
	source?: string;
	url?: string;
};

type EventItem = {
	name: string;
	when: string; // ISO
	country?: string;
	importance?: 'low' | 'medium' | 'high';
};

type MarketPayload = {
	quotes: Record<string, number>;
	changes?: Record<string, number>;
	indicators?: Record<string, any>;
};

export default function HomePage() {
	const [now, setNow] = useState(DateTime.now().setZone('America/Sao_Paulo'));
	useEffect(() => {
		const id = setInterval(() => setNow(DateTime.now().setZone('America/Sao_Paulo')), 1000);
		return () => clearInterval(id);
	}, []);

	const { data: dashboard } = useSWR<{ today: ScoreEntry; history: ScoreEntry[] }>(
		'/api/score',
		fetcher,
		{ refreshInterval: 60_000 }
	);
	const { data: news } = useSWR<NewsItem[]>('/api/news', fetcher, { refreshInterval: 60_000 });
	const { data: events } = useSWR<EventItem[]>('/api/events', fetcher, { refreshInterval: 60_000 });
	const { data: market } = useSWR<MarketPayload>('/api/market', fetcher, { refreshInterval: 60_000 });

	const chartData = useMemo(() => {
		const points = dashboard?.history ?? [];
		return {
			labels: points.map((p) => DateTime.fromISO(p.date).toFormat('dd/LL')),
			datasets: [
				{
					label: 'Score',
					data: points.map((p) => p.score),
					borderColor: (ctx: any) => {
						const value = ctx.chart.data.datasets[0].data[ctx.dataIndex] as number;
						return value >= 0 ? '#2ecc71' : '#e74c3c';
					},
					segment: {
						borderColor: (ctx: any) => {
							const value = ctx.p1.parsed.y;
							return value >= 0 ? '#2ecc71' : '#e74c3c';
						},
					},
					borderWidth: 2,
					pointRadius: 0,
					tension: 0.25,
				},
				{
					label: 'Neutro',
					data: points.map(() => 0),
					borderColor: '#7f8c8d',
					borderDash: [6, 6],
					borderWidth: 1,
					pointRadius: 0,
				},
			],
		};
	}, [dashboard?.history]);

	const chartOptions = useMemo(
		() => ({
			responsive: true,
			plugins: {
				legend: { display: false },
				tooltip: { mode: 'index' as const, intersect: false },
			},
			scales: {
				y: {
					grid: { color: '#ececec' },
				},
				x: { grid: { display: false } },
			},
		}),
		[]
	);

	const today = dashboard?.today;

	const tickers = ['USD/BRL=X', '^DXY', 'US10Y', '^VIX'] as const;
	const labelMap: Record<(typeof tickers)[number], string> = {
		'USD/BRL=X': 'USD/BRL',
		'^DXY': 'DXY',
		'US10Y': 'US 10Y',
		'^VIX': 'VIX',
	};
	function formatPrice(sym: (typeof tickers)[number], price?: number) {
		if (price == null) return '—';
		if (sym === 'USD/BRL=X') return price.toFixed(2);
		if (sym === '^DXY') return price.toFixed(1);
		if (sym === 'US10Y') return `${price.toFixed(2)}%`;
		if (sym === '^VIX') return price.toFixed(1);
		return String(price);
	}
	function formatPct(p?: number) {
		if (p == null) return '—';
		const sign = p > 0 ? '+' : '';
		return `${sign}${p.toFixed(2)}%`;
	}

	return (
		<main className="container-page">
			<header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Radar Econômico USD/BRL</h1>
					<p className="text-sm text-gray-600">Atualizado em {now.toFormat('dd/LL/yyyy HH:mm:ss')}</p>
				</div>
				<div className="bg-white rounded-lg shadow p-4 min-w-[260px]">
					<p className="text-xs uppercase text-gray-500">Score do dia</p>
					<p className="text-3xl font-bold">
						{today ? `${today.score >= 0 ? '+' : ''}${today.score} → ${today.bias}` : 'Carregando...'}
					</p>
					<p className="text-sm text-gray-600 mt-1">{today?.brief ?? 'Aguardando dados...'}</p>
				</div>
			</header>

			<section className="mt-6 bg-white rounded-lg shadow p-4">
				<h2 className="text-lg font-semibold mb-2">Histórico de Score (30 dias)</h2>
				<div className="h-64">
					<Line data={chartData} options={chartOptions} />
				</div>
			</section>

			<section className="mt-6 bg-white rounded-lg shadow p-4">
				<h3 className="text-lg font-semibold mb-3">Painel de mercado</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{tickers.map((sym) => {
						const price = market?.quotes?.[sym as string];
						const pct = market?.changes?.[sym as string];
						const up = typeof pct === 'number' ? pct > 0 : undefined;
						const color = up == null ? 'text-gray-500' : up ? 'text-brand-green' : 'text-brand-red';
						const arrow = up == null ? '' : up ? '▲' : '▼';
						return (
							<div key={sym} className="border rounded p-3">
								<div className="text-xs text-gray-500">{labelMap[sym]}</div>
								<div className="flex items-baseline justify-between">
									<div className="text-xl font-semibold">{formatPrice(sym, price)}</div>
									<div className={`text-sm ${color}`}>{arrow} {formatPct(pct)}</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<div className="grid md:grid-cols-2 gap-6 mt-6">
				<section className="bg-white rounded-lg shadow p-4">
					<h3 className="text-lg font-semibold mb-2">Notícias em tempo real</h3>
					<ul className="space-y-3">
						{(news ?? []).map((n, i) => (
							<li key={i} className="border-b border-gray-100 pb-2 last:border-none">
								<a className="hover:underline" href={n.url} target="_blank" rel="noreferrer">
									{n.title}
								</a>
								<div className="text-xs text-gray-500">
									{DateTime.fromISO(n.publishedAt).setZone('America/Sao_Paulo').toFormat('dd/LL HH:mm')} {n.source ? `· ${n.source}` : ''}
								</div>
							</li>
						))}
					</ul>
				</section>

				<section className="bg-white rounded-lg shadow p-4">
					<h3 className="text-lg font-semibold mb-2">Próximos eventos do dia</h3>
					<ul className="space-y-3">
						{(events ?? []).map((e, i) => {
							const diff = DateTime.fromISO(e.when).diff(now, ['hours', 'minutes', 'seconds']).toObject();
							const h = Math.max(0, Math.trunc(diff.hours ?? 0));
							const m = Math.max(0, Math.trunc(diff.minutes ?? 0));
							const s = Math.max(0, Math.trunc(diff.seconds ?? 0));
							return (
								<li key={i} className="border-b border-gray-100 pb-2 last:border-none">
									<div className="font-medium">{e.name}</div>
									<div className="text-xs text-gray-500">
										{DateTime.fromISO(e.when).setZone('America/Sao_Paulo').toFormat('HH:mm')} · em {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')} {e.country ? `· ${e.country}` : ''}
									</div>
								</li>
							);
						})}
					</ul>
				</section>
			</div>
		</main>
	);
}