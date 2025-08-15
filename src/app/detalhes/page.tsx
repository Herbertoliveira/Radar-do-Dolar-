"use client";

import useSWR from 'swr';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
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
	factors?: string[];
};

type EventItem = {
	name: string;
	when: string; // ISO
	country?: string;
	importance?: 'low' | 'medium' | 'high';
};

export default function DetailsPage() {
	const { data: dashboard } = useSWR<{ today: ScoreEntry; history: ScoreEntry[] }>(
		'/api/score',
		fetcher,
		{ refreshInterval: 60_000 }
	);
	const { data: events } = useSWR<EventItem[]>('/api/events', fetcher, { refreshInterval: 60_000 });

	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const scores = dashboard?.history ?? [];
	const selected = useMemo(() => {
		if (!scores.length) return null;
		const byDate = selectedDate ?? scores[scores.length - 1]?.date;
		return scores.find((s) => s.date === byDate) ?? null;
	}, [scores, selectedDate]);

	const chartData = useMemo(() => {
		return {
			labels: scores.map((p) => DateTime.fromISO(p.date).toFormat('dd/LL')),
			datasets: [
				{
					label: 'Score',
					data: scores.map((p) => p.score),
					borderColor: (ctx: any) => {
						const val = ctx.chart.data.datasets[0].data[ctx.dataIndex] as number;
						return val >= 0 ? '#2ecc71' : '#e74c3c';
					},
					segment: {
						borderColor: (ctx: any) => (ctx.p1.parsed.y >= 0 ? '#2ecc71' : '#e74c3c'),
					},
					borderWidth: 2,
					pointRadius: 3,
					pointBackgroundColor: '#333',
					tension: 0.25,
				},
				{
					label: 'Neutro',
					data: scores.map(() => 0),
					borderColor: '#7f8c8d',
					borderDash: [6, 6],
					borderWidth: 1,
					pointRadius: 0,
				},
			],
		};
	}, [scores]);

	return (
		<main className="container-page">
			<header className="flex items-end justify-between">
				<h1 className="text-2xl font-semibold">Detalhes</h1>
				<select
					className="bg-white rounded border px-3 py-2 text-sm"
					value={selectedDate ?? ''}
					onChange={(e) => setSelectedDate(e.target.value)}
				>
					<option value="">Selecionar dia</option>
					{scores.map((s) => (
						<option key={s.date} value={s.date}>
							{DateTime.fromISO(s.date).toFormat('dd/LL/yyyy')}
						</option>
					))}
				</select>
			</header>

			<section className="mt-6 bg-white rounded-lg shadow p-4">
				<h2 className="text-lg font-semibold">Histórico</h2>
				<div className="h-64 mt-2">
					<Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
				</div>
			</section>

			{selected && (
				<section className="mt-6 grid md:grid-cols-2 gap-6">
					<div className="bg-white rounded-lg shadow p-4">
						<h3 className="text-lg font-semibold">Resumo do viés do dia</h3>
						<p className="text-3xl font-bold mt-2">
							{selected.score >= 0 ? `+${selected.score}` : selected.score} → {selected.bias}
						</p>
						<p className="text-gray-700 mt-2">{selected.brief}</p>
						{selected.factors?.length ? (
							<ul className="list-disc list-inside text-sm text-gray-600 mt-3">
								{selected.factors.map((f, i) => (
									<li key={i}>{f}</li>
								))}
							</ul>
						) : null}
					</div>

					<div className="bg-white rounded-lg shadow p-4">
						<h3 className="text-lg font-semibold">Eventos macro do dia</h3>
						<ul className="space-y-2 mt-2">
							{(events ?? [])
								.filter((e) => DateTime.fromISO(e.when).toISODate() === DateTime.fromISO(selected.date).toISODate())
								.sort((a, b) => DateTime.fromISO(a.when).toMillis() - DateTime.fromISO(b.when).toMillis())
								.map((e, i) => (
									<li key={i} className="border-b border-gray-100 pb-2 last:border-none">
										<div className="font-medium">{e.name}</div>
										<div className="text-xs text-gray-500">
											{DateTime.fromISO(e.when).setZone('America/Sao_Paulo').toFormat('dd/LL HH:mm')} {e.country ? `· ${e.country}` : ''}
										</div>
									</li>
								))}
						</ul>
					</div>
				</section>
			)}
		</main>
	);
}