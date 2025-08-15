# Radar Econômico USD/BRL

Aplicativo Next.js que monitora USD/BRL com score macro diário, notícias em tempo real, eventos do dia com contagem regressiva e gráfico histórico.

## Rodando

1. Instale deps:

```
pnpm install
```

2. Dev server:

```
pnpm dev
```

Acesse http://localhost:3000

## Configuração de APIs
Acesse `/configuracoes` e informe as chaves:
- `RAPIDAPI_KEY` (Yahoo Finance via RapidAPI)
- `ALPHA_VANTAGE_KEY`
- `FRED_API_KEY`
- `TRADINGECONOMICS_KEY`
- `NEWS_API_KEY`

As chaves são mantidas em memória para fins de demo. Em produção, use variáveis de ambiente seguras.

## Endpoints
- `/api/market` — Cotações (RapidAPI/Yahoo + Alpha Vantage opcional, com fallback mock)
- `/api/news` — Notícias (NewsAPI, com fallback mock)
- `/api/events` — Calendário (TradingEconomics, com fallback)
- `/api/score` — Agrega dados e calcula score e histórico (30 dias)
- `/api/config` — Define chaves (memória)

## Estilo
- Fundo: `#f5f5f5`
- Linhas gráfico: verde `#2ecc71`, vermelha `#e74c3c`, cinza tracejada `#7f8c8d`

## Timezone
Todas as datas exibidas em America/Sao_Paulo (BRT).