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
	Filler,
} from 'chart.js';
import ScoreStats from '@/components/ScoreStats';
import ScoreAlerts from '@/components/ScoreAlerts';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ScoreEntry = {
	date: string;
	score: number;
	label: string;
	bias: 'Forte Compra' | 'Compra' | 'Neutro' | 'Venda' | 'Forte Venda';
	brief: string;
	factors?: string[];
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
	const [selectedDate, setSelectedDate] = useState<string>('');
	const [showDatePicker, setShowDatePicker] = useState(false);

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

	// Filtrar histórico baseado na data selecionada
	const filteredHistory = useMemo(() => {
		if (!dashboard?.history) return [];
		if (!selectedDate) return dashboard.history;
		
		const selected = DateTime.fromISO(selectedDate);
		return dashboard.history.filter(entry => {
			const entryDate = DateTime.fromISO(entry.date);
			return entryDate.hasSame(selected, 'day');
		});
	}, [dashboard?.history, selectedDate]);

	const chartData = useMemo(() => {
		const points = filteredHistory.length > 0 ? filteredHistory : (dashboard?.history ?? []);
		return {
			labels: points.map((p) => DateTime.fromISO(p.date).toFormat('dd/LL')),
			datasets: [
				{
					label: 'Score',
					data: points.map((p) => p.score),
					borderColor: (ctx: any) => {
						const value = ctx.chart.data.datasets[0].data[ctx.dataIndex] as number;
						if (value >= 3) return '#27ae60'; // Verde forte para compra clara
						if (value > 0) return '#2ecc71'; // Verde para viés comprador
						if (value <= -3) return '#c0392b'; // Vermelho forte para venda clara
						if (value < 0) return '#e74c3c'; // Vermelho para viés vendedor
						return '#95a5a6'; // Cinza para neutro
					},
					backgroundColor: (ctx: any) => {
						const value = ctx.chart.data.datasets[0].data[ctx.dataIndex] as number;
						if (value >= 3) return 'rgba(39, 174, 96, 0.1)';
						if (value > 0) return 'rgba(46, 204, 113, 0.1)';
						if (value <= -3) return 'rgba(192, 57, 43, 0.1)';
						if (value < 0) return 'rgba(231, 76, 60, 0.1)';
						return 'rgba(149, 165, 166, 0.1)';
					},
					segment: {
						borderColor: (ctx: any) => {
							const value = ctx.p1.parsed.y;
							if (value >= 3) return '#27ae60';
							if (value > 0) return '#2ecc71';
							if (value <= -3) return '#c0392b';
							if (value < 0) return '#e74c3c';
							return '#95a5a6';
						},
					},
					borderWidth: 3,
					pointRadius: 4,
					pointBackgroundColor: (ctx: any) => {
						const value = ctx.chart.data.datasets[0].data[ctx.dataIndex] as number;
						if (value >= 3) return '#27ae60';
						if (value > 0) return '#2ecc71';
						if (value <= -3) return '#c0392b';
						if (value < 0) return '#e74c3c';
						return '#95a5a6';
					},
					pointBorderColor: '#fff',
					pointBorderWidth: 2,
					tension: 0.2,
					fill: true,
				},
				{
					label: 'Neutro',
					data: points.map(() => 0),
					borderColor: '#7f8c8d',
					borderDash: [6, 6],
					borderWidth: 2,
					pointRadius: 0,
				},
				{
					label: 'Compra Clara',
					data: points.map(() => 3),
					borderColor: '#27ae60',
					borderDash: [3, 3],
					borderWidth: 1,
					pointRadius: 0,
				},
				{
					label: 'Venda Clara',
					data: points.map(() => -3),
					borderColor: '#c0392b',
					borderDash: [3, 3],
					borderWidth: 1,
					pointRadius: 0,
				},
			],
		};
	}, [filteredHistory, dashboard?.history]);

	const chartOptions = useMemo(
		() => ({
			responsive: true,
			plugins: {
				legend: { 
					display: true,
					position: 'top' as const,
					labels: {
						usePointStyle: true,
						padding: 20,
					}
				},
				tooltip: { 
					mode: 'index' as const, 
					intersect: false,
					callbacks: {
						label: (context: any) => {
							const value = context.parsed.y;
							let label = context.dataset.label || '';
							if (label === 'Score') {
								if (value >= 3) label = 'Compra Clara';
								else if (value > 0) label = 'Viés Comprador';
								else if (value <= -3) label = 'Venda Clara';
								else if (value < 0) label = 'Viés Vendedor';
								else label = 'Neutro';
							}
							return `${label}: ${value}`;
						}
					}
				},
			},
			scales: {
				y: {
					grid: { color: '#ececec' },
					min: -5,
					max: 5,
					ticks: {
						callback: (value: any) => {
							if (value === 3) return 'Compra Clara';
							if (value === -3) return 'Venda Clara';
							if (value === 0) return 'Neutro';
							return value;
						}
					}
				},
				x: { grid: { display: false } },
			},
			interaction: {
				mode: 'nearest' as const,
				axis: 'x' as const,
				intersect: false,
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

	function getScoreColor(score: number) {
		if (score >= 3) return 'text-green-700 bg-green-100 border-green-300';
		if (score > 0) return 'text-green-600 bg-green-50 border-green-200';
		if (score <= -3) return 'text-red-700 bg-red-100 border-red-300';
		if (score < 0) return 'text-red-600 bg-red-50 border-red-200';
		return 'text-gray-600 bg-gray-50 border-gray-200';
	}

	function getScoreIcon(score: number) {
		if (score >= 3) return '🚀';
		if (score > 0) return '📈';
		if (score <= -3) return '📉';
		if (score < 0) return '🔻';
		return '➖';
	}

	// Gerar opções de data para o seletor
	const dateOptions = useMemo(() => {
		if (!dashboard?.history) return [];
		
		const dates = dashboard.history.map(entry => entry.date);
		const uniqueDates = [...new Set(dates)].sort().reverse();
		
		return uniqueDates.map(date => ({
			value: date,
			label: DateTime.fromISO(date).toFormat('dd/LL/yyyy')
		}));
	}, [dashboard?.history]);

	return (
		<main className="container-page">
			<header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Radar Econômico USD/BRL</h1>
					<p className="text-sm text-gray-600">Atualizado em {now.toFormat('dd/LL/yyyy HH:mm:ss')}</p>
				</div>
				<div className={`bg-white rounded-xl shadow-lg p-6 min-w-[300px] border-2 ${getScoreColor(today?.score || 0)}`}>
					<div className="flex items-center gap-3 mb-2">
						<span className="text-2xl">{getScoreIcon(today?.score || 0)}</span>
						<p className="text-xs uppercase text-gray-500 font-medium">Score do dia</p>
					</div>
					<p className="text-4xl font-bold mb-2">
						{today ? `${today.score >= 0 ? '+' : ''}${today.score}` : 'Carregando...'}
					</p>
					<p className="text-lg font-semibold mb-2">
						{today ? today.bias : 'Aguardando dados...'}
					</p>
					<p className="text-sm text-gray-600">{today?.brief ?? 'Aguardando dados...'}</p>
				</div>
			</header>

			{/* Seletor de Data */}
			<section className="mt-6 bg-white rounded-xl shadow-lg p-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Histórico de Score</h2>
					<div className="flex items-center gap-3">
						<button
							onClick={() => setShowDatePicker(!showDatePicker)}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							{showDatePicker ? 'Ocultar' : 'Selecionar Data'}
						</button>
						{selectedDate && (
							<button
								onClick={() => {
									setSelectedDate('');
									setShowDatePicker(false);
								}}
								className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
							>
								Limpar
							</button>
						)}
					</div>
				</div>
				
				{showDatePicker && (
					<div className="mb-4 p-4 bg-gray-50 rounded-lg">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Selecione uma data para visualizar o histórico:
						</label>
						<select
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">Todas as datas (30 dias)</option>
							{dateOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>
				)}

				<div className="h-80">
					<Line data={chartData} options={chartOptions} />
				</div>

				{/* Legenda do Score */}
				<div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
					<div className="text-center p-3 bg-green-100 border border-green-300 rounded-lg">
						<div className="text-2xl">🚀</div>
						<div className="text-sm font-semibold text-green-800">Compra Clara</div>
						<div className="text-xs text-green-600">Score ≥ +3</div>
					</div>
					<div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
						<div className="text-2xl">📈</div>
						<div className="text-sm font-semibold text-green-700">Viés Comprador</div>
						<div className="text-xs text-green-600">Score +1 a +2.9</div>
					</div>
					<div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
						<div className="text-2xl">➖</div>
						<div className="text-sm font-semibold text-gray-700">Neutro</div>
						<div className="text-xs text-gray-600">Score -2.9 a +0.9</div>
					</div>
					<div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
						<div className="text-2xl">🔻</div>
						<div className="text-sm font-semibold text-red-700">Viés Vendedor</div>
						<div className="text-xs text-red-600">Score -1 a -2.9</div>
					</div>
					<div className="text-center p-3 bg-red-100 border border-red-300 rounded-lg">
						<div className="text-2xl">📉</div>
						<div className="text-sm font-semibold text-red-800">Venda Clara</div>
						<div className="text-xs text-red-600">Score ≤ -3</div>
					</div>
				</div>
			</section>

			{/* Fatores do Score */}
			{today?.factors && today.factors.length > 0 && (
				<section className="mt-6 bg-white rounded-xl shadow-lg p-6">
					<h3 className="text-xl font-semibold mb-4">Fatores que Influenciaram o Score</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{today.factors.map((factor, index) => (
							<div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<div className="text-sm text-blue-800">{factor}</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Estatísticas do Score */}
			{dashboard?.history && dashboard.history.length > 0 && (
				<ScoreStats history={dashboard.history} />
			)}

			{/* Alertas e Notificações */}
			{today && dashboard?.history && (
				<ScoreAlerts today={today} history={dashboard.history} />
			)}

			<section className="mt-6 bg-white rounded-xl shadow-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Painel de Mercado</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{tickers.map((sym) => {
						const price = market?.quotes?.[sym as string];
						const pct = market?.changes?.[sym as string];
						const up = typeof pct === 'number' ? pct > 0 : undefined;
						const color = up == null ? 'text-gray-500' : up ? 'text-green-600' : 'text-red-600';
						const bgColor = up == null ? 'bg-gray-50' : up ? 'bg-green-50' : 'bg-red-50';
						const borderColor = up == null ? 'border-gray-200' : up ? 'border-green-200' : 'border-red-200';
						const arrow = up == null ? '' : up ? '▲' : '▼';
						
						return (
							<div key={sym} className={`border-2 rounded-xl p-4 ${bgColor} ${borderColor}`}>
								<div className="text-xs text-gray-500 font-medium mb-2">{labelMap[sym]}</div>
								<div className="flex items-baseline justify-between">
									<div className="text-2xl font-bold">{formatPrice(sym, price)}</div>
									<div className={`text-sm font-semibold ${color}`}>
										{arrow} {formatPct(pct)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<div className="grid md:grid-cols-2 gap-6 mt-6">
				<section className="bg-white rounded-xl shadow-lg p-6">
					<h3 className="text-xl font-semibold mb-4">Notícias em Tempo Real</h3>
					<ul className="space-y-4">
						{(news ?? []).map((n, i) => (
							<li key={i} className="border-b border-gray-100 pb-3 last:border-none">
								<a className="hover:underline text-blue-600 font-medium" href={n.url} target="_blank" rel="noreferrer">
									{n.title}
								</a>
								<div className="text-xs text-gray-500 mt-1">
									{DateTime.fromISO(n.publishedAt).setZone('America/Sao_Paulo').toFormat('dd/LL HH:mm')} 
									{n.source ? ` · ${n.source}` : ''}
								</div>
							</li>
						))}
					</ul>
				</section>

				<section className="bg-white rounded-xl shadow-lg p-6">
					<h3 className="text-xl font-semibold mb-4">Próximos Eventos do Dia</h3>
					<ul className="space-y-4">
						{(events ?? []).map((e, i) => {
							const diff = DateTime.fromISO(e.when).diff(now, ['hours', 'minutes', 'seconds']).toObject();
							const h = Math.max(0, Math.trunc(diff.hours ?? 0));
							const m = Math.max(0, Math.trunc(diff.minutes ?? 0));
							const s = Math.max(0, Math.trunc(diff.seconds ?? 0));
							
							return (
								<li key={i} className="border-b border-gray-100 pb-3 last:border-none">
									<div className="font-medium text-gray-800">{e.name}</div>
									<div className="text-xs text-gray-500 mt-1">
										{DateTime.fromISO(e.when).setZone('America/Sao_Paulo').toFormat('HH:mm')} · 
										em {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')} 
										{e.country ? ` · ${e.country}` : ''}
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