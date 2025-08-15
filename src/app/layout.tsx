import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Radar Econômico USD/BRL',
	description: 'Monitor de USD/BRL com score macro, notícias e eventos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-br">
			<body className="min-h-screen bg-brand-bg text-gray-900 antialiased">
				<header className="bg-white border-b">
					<div className="container-page flex items-center justify-between py-3">
						<a href="/" className="font-semibold">Radar Econômico USD/BRL</a>
						<nav className="flex items-center gap-4 text-sm">
							<a className="hover:underline" href="/">Início</a>
							<a className="hover:underline" href="/detalhes">Detalhes</a>
							<a className="hover:underline" href="/configuracoes">Configurações</a>
						</nav>
					</div>
				</header>
				{children}
			</body>
		</html>
	);
}