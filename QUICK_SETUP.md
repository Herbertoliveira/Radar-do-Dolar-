# 🚀 Configuração Rápida das Chaves de API

## ⚡ **Configuração em 3 Passos**

### **Passo 1: Obter Chaves (5 minutos)**
1. **NewsAPI**: https://newsapi.org/ → "Get API Key" → Cadastro → Copiar chave
2. **RapidAPI**: https://rapidapi.com/ → Cadastro → "Yahoo Finance" → Inscrever → Copiar chave

### **Passo 2: Configurar (2 minutos)**
```bash
# Editar arquivo .env
nano .env

# Substituir estas linhas:
NEWS_API_KEY=your_news_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here

# Por suas chaves reais:
NEWS_API_KEY=abc123def456ghi789
RAPIDAPI_KEY=xyz789abc123def456
```

### **Passo 3: Testar (1 minuto)**
```bash
# Iniciar servidor
pnpm dev

# Em outro terminal, testar
npm run test:logging
```

## 🔑 **Chaves Obrigatórias (Mínimo)**

| API | Site | Plano Gratuito | Para que serve |
|-----|------|----------------|----------------|
| **NewsAPI** | https://newsapi.org/ | 1,000/dia | Notícias PT/EN/ES |
| **RapidAPI** | https://rapidapi.com/ | 500/mês | Cotações Yahoo Finance |

## 🔑 **Chaves Opcionais (Recomendadas)**

| API | Site | Plano Gratuito | Para que serve |
|-----|------|----------------|----------------|
| **Alpha Vantage** | https://www.alphavantage.co/ | 500/dia | Indicadores adicionais |
| **Trading Economics** | https://tradingeconomics.com/ | Limitado | Eventos econômicos |
| **FRED** | https://fred.stlouisfed.org/ | Ilimitado | Dados econômicos EUA |

## 🎯 **Prioridades**

### **🔥 Alta Prioridade (Funcionamento básico)**
- ✅ NEWS_API_KEY
- ✅ RAPIDAPI_KEY

### **⚡ Média Prioridade (Melhor experiência)**
- ⚪ ALPHA_VANTAGE_KEY
- ⚪ TRADINGECONOMICS_KEY

### **💎 Baixa Prioridade (Funcionalidades extras)**
- ⚪ FRED_API_KEY

## 🚨 **Problemas Comuns**

### **"API key invalid"**
- ✅ Verificar se copiou a chave completa
- ✅ Confirmar se a API está ativa
- ✅ Verificar limites de uso

### **"Rate limit exceeded"**
- ⏳ Aguardar reset do limite
- 🔄 Usar dados mock temporariamente
- 💰 Considerar upgrade do plano

### **Dados "Mock" aparecendo**
- 🔑 Verificar se as chaves estão configuradas
- 📝 Confirmar se o arquivo .env foi salvo
- 🔄 Reiniciar o servidor após mudanças

## 📱 **Teste Rápido**

```bash
# Teste individual das APIs
curl "http://localhost:3000/api/news?category=usd-brl&lang=pt&pageSize=3"
curl "http://localhost:3000/api/market"
curl "http://localhost:3000/api/events"
```

## ✅ **Indicadores de Sucesso**

- 🗞️ Notícias com fontes reais (Reuters, Bloomberg, etc.)
- 📊 Cotações com valores atuais (não 5.35 fixo)
- 📝 Logs mostram "Provider: NewsAPI", "Provider: Yahoo Finance"
- ⚡ Sem erros de API nos logs

## 🆘 **Precisa de Ajuda?**

1. **Verifique os logs** no console
2. **Confirme as chaves** no arquivo .env
3. **Teste as APIs** individualmente
4. **Verifique os limites** de uso

---

**🎉 Após configurar: `pnpm dev` → http://localhost:3000**