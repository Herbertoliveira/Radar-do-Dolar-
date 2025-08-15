"use client";

import { useEffect, useState } from 'react';

export default function SettingsPage() {
	const [values, setValues] = useState<Record<string, string>>({});
	const [masked, setMasked] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);
	const fields = ['RAPIDAPI_KEY', 'ALPHA_VANTAGE_KEY', 'FRED_API_KEY', 'TRADINGECONOMICS_KEY', 'NEWS_API_KEY'];

	useEffect(() => {
		fetch('/api/config').then((r) => r.json()).then((d) => setMasked(d.keys ?? {}));
	}, []);

	function onChange(k: string, v: string) {
		setValues((s) => ({ ...s, [k]: v }));
	}

	async function onSave() {
		setSaving(true);
		await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
		const d = await fetch('/api/config').then((r) => r.json());
		setMasked(d.keys ?? {});
		setValues({});
		setSaving(false);
	}

	return (
		<main className="container-page">
			<h1 className="text-2xl font-semibold">Configurações</h1>
			<p className="text-sm text-gray-600">Insira as chaves de API para habilitar integrações em tempo real.</p>
			<div className="mt-6 grid md:grid-cols-2 gap-4">
				{fields.map((k) => (
					<div key={k} className="bg-white rounded shadow p-4">
						<label className="text-sm font-medium">{k}</label>
						<input
							type="password"
							className="mt-1 w-full rounded border px-3 py-2 text-sm"
							placeholder={masked[k] ? `Atual: ${masked[k]}` : 'Não configurada'}
							value={values[k] ?? ''}
							onChange={(e) => onChange(k, e.target.value)}
						/>
					</div>
				))}
			</div>
			<button onClick={onSave} disabled={saving} className="mt-4 bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50">
				{saving ? 'Salvando...' : 'Salvar'}
			</button>
		</main>
	);
}