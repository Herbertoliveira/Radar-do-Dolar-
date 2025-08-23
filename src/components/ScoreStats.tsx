import React from 'react';
import { DateTime } from 'luxon';

type ScoreStatsProps = {
	history: Array<{
		date: string;
		score: number;
		bias: string;
	}>;
};

export default function ScoreStats({ history }: ScoreStatsProps) {
	if (!history || history.length === 0) {
		return null;
	}

	// Calcular estatísticas
	const totalDays = history.length;
	const positiveDays = history.filter(entry => entry.score > 0).length;
	const negativeDays = history.filter(entry => entry.score < 0).length;
	const neutralDays = history.filter(entry => entry.score === 0).length;
	
	const strongBuyDays = history.filter(entry => entry.score >= 3).length;
	const strongSellDays = history.filter(entry => entry.score <= -3).length;
	
	const averageScore = history.reduce((sum, entry) => sum + entry.score, 0) / totalDays;
	const maxScore = Math.max(...history.map(entry => entry.score));
	const minScore = Math.min(...history.map(entry => entry.score));
	
	const recentTrend = history.slice(-7).reduce((sum, entry) => sum + entry.score, 0) / 7;
	const previousWeek = history.slice(-14, -7).reduce((sum, entry) => sum + entry.score, 0) / 7;
	const trendDirection = recentTrend > previousWeek ? 'up' : recentTrend < previousWeek ? 'down' : 'stable';

	// Encontrar sequências
	let currentStreak = 0;
	let maxStreak = 0;
	let currentDirection: 'positive' | 'negative' | 'neutral' = 'neutral';
	
	for (let i = history.length - 1; i >= 0; i--) {
		const score = history[i].score;
		let direction: 'positive' | 'negative' | 'neutral';
		
		if (score > 0) direction = 'positive';
		else if (score < 0) direction = 'negative';
		else direction = 'neutral';
		
		if (i === history.length - 1 || direction === currentDirection) {
			currentStreak++;
			currentDirection = direction;
		} else {
			break;
		}
	}

	// Calcular volatilidade
	const variance = history.reduce((sum, entry) => sum + Math.pow(entry.score - averageScore, 2), 0) / totalDays;
	const volatility = Math.sqrt(variance);

	return (
		<section className="mt-6 bg-white rounded-xl shadow-lg p-6">
			<h3 className="text-xl font-semibold mb-6">Estatísticas do Score</h3>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Estatísticas Gerais */}
				<div className="space-y-4">
					<h4 className="text-lg font-medium text-gray-700">Visão Geral</h4>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Total de dias:</span>
							<span className="font-semibold">{totalDays}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Score médio:</span>
							<span className={`font-semibold ${averageScore > 0 ? 'text-green-600' : averageScore < 0 ? 'text-red-600' : 'text-gray-600'}`}>
								{averageScore.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Volatilidade:</span>
							<span className="font-semibold text-gray-600">{volatility.toFixed(2)}</span>
						</div>
					</div>
				</div>

				{/* Distribuição por Bias */}
				<div className="space-y-4">
					<h4 className="text-lg font-medium text-gray-700">Distribuição</h4>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Dias positivos:</span>
							<span className="font-semibold text-green-600">{positiveDays} ({((positiveDays/totalDays)*100).toFixed(1)}%)</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Dias negativos:</span>
							<span className="font-semibold text-red-600">{negativeDays} ({((negativeDays/totalDays)*100).toFixed(1)}%)</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Dias neutros:</span>
							<span className="font-semibold text-gray-600">{neutralDays} ({((neutralDays/totalDays)*100).toFixed(1)}%)</span>
						</div>
					</div>
				</div>

				{/* Extremos */}
				<div className="space-y-4">
					<h4 className="text-lg font-medium text-gray-700">Extremos</h4>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Score máximo:</span>
							<span className="font-semibold text-green-600">+{maxScore.toFixed(1)}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Score mínimo:</span>
							<span className="font-semibold text-red-600">{minScore.toFixed(1)}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Compra clara:</span>
							<span className="font-semibold text-green-600">{strongBuyDays} dias</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Venda clara:</span>
							<span className="font-semibold text-red-600">{strongSellDays} dias</span>
						</div>
					</div>
				</div>

				{/* Tendências */}
				<div className="space-y-4">
					<h4 className="text-lg font-medium text-gray-700">Tendências</h4>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Última semana:</span>
							<span className={`font-semibold ${recentTrend > 0 ? 'text-green-600' : recentTrend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
								{recentTrend > 0 ? '+' : ''}{recentTrend.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Semana anterior:</span>
							<span className={`font-semibold ${previousWeek > 0 ? 'text-green-600' : previousWeek < 0 ? 'text-red-600' : 'text-gray-600'}`}>
								{previousWeek > 0 ? '+' : ''}{previousWeek.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Direção:</span>
							<span className={`font-semibold ${
								trendDirection === 'up' ? 'text-green-600' : 
								trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
							}`}>
								{trendDirection === 'up' ? '↗️ Subindo' : 
								 trendDirection === 'down' ? '↘️ Caindo' : '→ Estável'}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Sequência atual:</span>
							<span className="font-semibold text-blue-600">{currentStreak} dias</span>
						</div>
					</div>
				</div>
			</div>

			{/* Gráfico de barras simples para distribuição */}
			<div className="mt-8">
				<h4 className="text-lg font-medium text-gray-700 mb-4">Distribuição Visual dos Scores</h4>
				<div className="h-32 flex items-end justify-center gap-1">
					{Array.from({ length: 11 }, (_, i) => {
						const score = i - 5; // -5 a +5
						const count = history.filter(entry => Math.abs(entry.score - score) < 0.5).length;
						const height = count > 0 ? (count / Math.max(...Array.from({ length: 11 }, (_, j) => 
							history.filter(entry => Math.abs(entry.score - (j - 5)) < 0.5).length
						))) * 100 : 0;
						
						return (
							<div key={score} className="flex flex-col items-center">
								<div 
									className={`w-8 rounded-t transition-all duration-300 ${
										score > 0 ? 'bg-green-500' : score < 0 ? 'bg-red-500' : 'bg-gray-500'
									}`}
									style={{ height: `${height}%` }}
								/>
								<span className="text-xs text-gray-500 mt-1">{score}</span>
							</div>
						);
					})}
				</div>
				<div className="text-center text-sm text-gray-500 mt-2">
					Distribuição dos scores de -5 a +5
				</div>
			</div>
		</section>
	);
}