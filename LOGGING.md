# Sistema de Logging para APIs

Este documento descreve o sistema de logging implementado para monitorar todas as rotas da API (`/api/*`) com mascaramento automático de dados sensíveis.

## 🚀 Funcionalidades

### ✅ Logging Detalhado
- **Todas as rotas da API** são automaticamente logadas
- **Request ID único** para rastreamento de requisições
- **Timestamps precisos** com timezone
- **Duração das requisições** para análise de performance
- **Status codes** e respostas das APIs externas
- **Cache hits/misses** para otimização

### 🔒 Mascaramento de Dados Sensíveis
- **API Keys** (NewsAPI, RapidAPI, Alpha Vantage, etc.)
- **Tokens de autorização**
- **Senhas e credenciais**
- **Números de cartão de crédito**
- **Emails e telefones**
- **Endereços IP**

### 🌍 Suporte Multilíngue para Notícias
- **Português (PT)** - Query principal otimizada
- **Inglês (EN)** - Cobertura internacional
- **Espanhol (ES)** - Mercado latino-americano
- **Fallback automático** entre idiomas
- **Queries expandidas** com sinônimos e termos relacionados

## 📁 Estrutura dos Arquivos

```
src/
├── lib/
│   ├── logger.ts              # Sistema principal de logging
│   ├── logger-config.ts       # Configurações do logger
│   └── news-queries.ts        # Queries multilíngues para notícias
├── app/api/
│   ├── news/route.ts          # Rota de notícias com logging
│   ├── market/route.ts        # Rota de mercado com logging
│   ├── events/route.ts        # Rota de eventos com logging
│   ├── score/route.ts         # Rota de score com logging
│   └── config/route.ts        # Rota de configuração com logging
└── middleware.ts               # Middleware global para captura de dados
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Níveis de log (info,warn,error)
LOG_LEVEL=info,warn,error

# Saída de logs (console,file)
LOG_OUTPUT=console,file

# Caminho do arquivo de log
LOG_FILE_PATH=./logs/api.log

# Habilitar mascaramento
LOG_MASKING_ENABLED=true

# Threshold para requisições lentas (ms)
LOG_SLOW_REQUEST_THRESHOLD=1000
```

### Configuração Padrão

```typescript
const defaultConfig = {
  levels: { info: true, warn: true, error: true },
  output: { console: true, file: false, filePath: './logs/api.log' },
  masking: { enabled: true },
  performance: { slowRequestThreshold: 1000 },
  context: { includeUserAgent: true, includeIP: true }
};
```

## 📊 Exemplos de Logs

### Log de Requisição Bem-sucedida

```
[2024-01-15 14:30:25.123] INFO GET /api/news [200] (245ms) [Cache: MISS] [ID: req_1705327825123_abc123def] [Provider: NewsAPI]
  Request: {"category":"usd-brl","language":"pt","pageSize":20}
  Response: {"items":[...],"metadata":{...}}
```

### Log de Erro de API

```
[2024-01-15 14:30:26.456] ERROR GET /api/market [500] (1200ms) [ID: req_1705327826456_xyz789ghi] [Provider: Yahoo Finance (RapidAPI)]
  Error: Yahoo Finance API error: Rate limit exceeded
  Request: {"symbols":["USD/BRL=X","^DXY","^VIX"],"region":"US"}
```

### Log de Cache Hit

```
[2024-01-15 14:30:27.789] INFO GET /api/score [200] (5ms) [Cache: HIT] [ID: req_1705327827789_mno456pqr] [Provider: cache]
```

## 🌐 Queries de Notícias Multilíngues

### Categorias Disponíveis

1. **`usd-brl`** - Notícias sobre USD/BRL
2. **`global-markets`** - Mercados financeiros globais
3. **`emerging-markets`** - Mercados emergentes
4. **`commodities`** - Commodities e matérias-primas
5. **`central-banks`** - Bancos centrais e política monetária

### Uso das APIs

```typescript
// Notícias em português
GET /api/news?category=usd-brl&lang=pt

// Notícias em inglês
GET /api/news?category=global-markets&lang=en

// Notícias em espanhol
GET /api/news?category=emerging-markets&lang=es

// Com paginação personalizada
GET /api/news?category=usd-brl&lang=pt&pageSize=50
```

### Queries Expandidas

Cada categoria inclui:
- **Sinônimos** para termos principais
- **Variações linguísticas** apropriadas
- **Termos relacionados** para ampliar cobertura
- **Fallback automático** entre idiomas

## 📈 Monitoramento de Performance

### Métricas Capturadas

- **Tempo de resposta** de cada API
- **Taxa de cache hit/miss**
- **Requisições lentas** (configurável)
- **Erros de APIs externas**
- **Uso de recursos** (memória, tempo)

### Alertas Automáticos

- **APIs com alta latência**
- **Taxa de erro elevada**
- **Cache ineficiente**
- **Rate limiting** de APIs externas

## 🛠️ Uso do Logger

### Logger Simples

```typescript
import { apiLogger } from '@/lib/logger';

// Log básico
apiLogger.info('/api/news', 'GET', { category: 'usd-brl' });
apiLogger.warn('/api/news', 'GET', { reason: 'No articles found' });
apiLogger.error('/api/news', 'GET', 'API error', { error: 'Rate limit' });
```

### Logger com Contexto

```typescript
const logger = apiLogger.createRequestLogger('/api/news', 'GET');

logger.logInfo({ category: 'usd-brl', language: 'pt' });
logger.logResponse(200, data, false, 'NewsAPI');
logger.logError('API failed', { retryCount: 3 });
```

## 🔍 Análise de Logs

### Filtros Úteis

```bash
# Todas as requisições lentas (>1s)
grep "slow" logs/api.log

# Erros de uma API específica
grep "Provider: NewsAPI" logs/api.log | grep "ERROR"

# Cache hits de uma rota
grep "/api/news" logs/api.log | grep "Cache: HIT"

# Requisições de um IP específico
grep "IP: 192.168.1.100" logs/api.log
```

### Análise de Performance

```bash
# Média de tempo de resposta por rota
awk '/\[200\]/ {print $4, $6}' logs/api.log | sort | uniq -c

# Top 10 requisições mais lentas
grep -o '([0-9]+ms)' logs/api.log | sort -n | tail -10
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Logs não aparecem**
   - Verificar `LOG_LEVEL` e `LOG_OUTPUT`
   - Confirmar permissões de escrita no diretório de logs

2. **Dados sensíveis não mascarados**
   - Verificar `LOG_MASKING_ENABLED=true`
   - Adicionar padrões personalizados em `logger-config.ts`

3. **Performance degradada**
   - Ajustar `LOG_SLOW_REQUEST_THRESHOLD`
   - Desabilitar logs de cache se necessário

### Debug

```typescript
// Habilitar debug detalhado
process.env.LOG_LEVEL = 'info,warn,error';
process.env.LOG_OUTPUT = 'console,file';
process.env.LOG_MASKING_ENABLED = 'true';
```

## 📚 Referências

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Luxon DateTime](https://moment.github.io/luxon/)
- [Node.js Logging Best Practices](https://nodejs.org/en/docs/guides/logging/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)