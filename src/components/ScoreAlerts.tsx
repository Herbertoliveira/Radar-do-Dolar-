import React from 'react';

type ScoreAlertsProps = {
	today: {
		score: number;
		bias: string;
		factors?: string[];
	} | null;
	history: Array<{
		date: string;
		score: number;
		bias: string;
	}>;
};

export default function ScoreAlerts({ today, history }: ScoreAlertsProps) {
	if (!today || !history || history.length === 0) {
		return null;
	}

	// Analisar padrões e gerar alertas
	const alerts: Array<{
		type: 'info' | 'warning' | 'success' | 'danger';
		title: string;
		message: string;
		icon: string;
	}> = [];

	// Alerta para mudança brusca de score
	if (history.length >= 2) {
		const currentScore = today.score;
		const previousScore = history[history.length - 2].score;
		const scoreChange = Math.abs(currentScore - previousScore);
		
		if (scoreChange >= 2) {
			alerts.push({
				type: 'warning',
				title: 'Mudança Brusca Detectada',
				message: `Score mudou de ${previousScore.toFixed(1)} para ${currentScore.toFixed(1)} (variação de ${scoreChange.toFixed(1)} pontos)`,
				icon: '⚠️'
			});
		}
	}

	// Alerta para sequência de scores
	if (history.length >= 3) {
		const lastThree = history.slice(-3);
		const allPositive = lastThree.every(entry => entry.score > 0);
		const allNegative = lastThree.every(entry => entry.score < 0);
		
		if (allPositive && lastThree.length === 3) {
			alerts.push({
				type: 'success',
				title: 'Tendência Positiva',
				message: 'Score positivo por 3 dias consecutivos - viés comprador se mantém',
				icon: '📈'
			});
		}
		
		if (allNegative && lastThree.length === 3) {
			alerts.push({
				type: 'danger',
				title: 'Tendência Negativa',
				message: 'Score negativo por 3 dias consecutivos - viés vendedor se mantém',
				icon: '📉'
			});
		}
	}

	// Alerta para score extremo
	if (today.score >= 4) {
		alerts.push({
			type: 'success',
			title: 'Sinal Forte de Compra',
			message: 'Score muito alto indica condições excepcionais para compra de USD',
			icon: '🚀'
		});
	}
	
	if (today.score <= -4) {
		alerts.push({
			type: 'danger',
			title: 'Sinal Forte de Venda',
			message: 'Score muito baixo indica condições excepcionais para venda de USD',
			icon: '📉'
		});
	}

	// Alerta para reversão de tendência
	if (history.length >= 5) {
		const lastFive = history.slice(-5);
		const firstHalf = lastFive.slice(0, 3);
		const secondHalf = lastFive.slice(3);
		
		const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.score, 0) / firstHalf.length;
		const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.score, 0) / secondHalf.length;
		
		if ((firstAvg > 0 && secondAvg < 0) || (firstAvg < 0 && secondAvg > 0)) {
			alerts.push({
				type: 'info',
				title: 'Possível Reversão',
				message: 'Tendência pode estar se revertendo - monitore os próximos dias',
				icon: '🔄'
			});
		}
	}

	// Alerta para volatilidade
	if (history.length >= 7) {
		const lastWeek = history.slice(-7);
		const scores = lastWeek.map(entry => entry.score);
		const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
		const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
		const volatility = Math.sqrt(variance);
		
		if (volatility > 2) {
			alerts.push({
				type: 'warning',
				title: 'Alta Volatilidade',
				message: 'Score apresentando alta volatilidade - mercado instável',
				icon: '⚡'
			});
		}
	}

	if (alerts.length === 0) {
		return (
			<section className="mt-6 bg-white rounded-xl shadow-lg p-6">
				<h3 className="text-xl font-semibold mb-4">Alertas e Notificações</h3>
				<div className="text-center py-8 text-gray-500">
					<div className="text-4xl mb-2">✅</div>
					<p className="text-lg">Nenhum alerta importante no momento</p>
					<p className="text-sm">O mercado está estável</p>
				</div>
			</section>
		);
	}

	return (
		<section className="mt-6 bg-white rounded-xl shadow-lg p-6">
			<h3 className="text-xl font-semibold mb-4">Alertas e Notificações</h3>
			<div className="space-y-4">
				{alerts.map((alert, index) => (
					<div
						key={index}
						className={`p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
							alert.type === 'success' ? 'bg-green-50 border-green-400' :
							alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
							alert.type === 'danger' ? 'bg-red-50 border-red-400' :
							'bg-blue-50 border-blue-400'
						}`}
					>
						<div className="flex items-start gap-3">
							<span className="text-2xl">{alert.icon}</span>
							<div className="flex-1">
								<h4 className={`font-semibold mb-1 ${
									alert.type === 'success' ? 'text-green-800' :
									alert.type === 'warning' ? 'text-yellow-800' :
									alert.type === 'danger' ? 'text-red-800' :
									'text-blue-800'
								}`}>
									{alert.title}
								</h4>
								<p className={`text-sm ${
									alert.type === 'success' ? 'text-green-700' :
									alert.type === 'warning' ? 'text-yellow-700' :
									alert.type === 'danger' ? 'text-red-700' :
									'text-blue-700'
								}`}>
									{alert.message}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
			
			<div className="mt-4 p-3 bg-gray-50 rounded-lg">
				<p className="text-xs text-gray-600 text-center">
					💡 Os alertas são gerados automaticamente baseados na análise do score e histórico
				</p>
			</div>
		</section>
	);
}