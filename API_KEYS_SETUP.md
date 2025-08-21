# 🔑 Guia de Configuração das Chaves de API

## 📋 **Chaves Necessárias**

### **1. NEWS_API_KEY** ⭐ **OBRIGATÓRIA**
- **Site**: https://newsapi.org/
- **Plano Gratuito**: 1,000 requests/dia
- **Para que serve**: Notícias em tempo real em PT/EN/ES
- **Como obter**:
  1. Acesse https://newsapi.org/
  2. Clique em "Get API Key"
  3. Faça login/cadastro
  4. Copie sua chave

### **2. RAPIDAPI_KEY** ⭐ **OBRIGATÓRIA**
- **Site**: https://rapidapi.com/
- **Plano Gratuito**: 500 requests/mês
- **Para que serve**: Cotações de mercado (Yahoo Finance)
- **Como obter**:
  1. Acesse https://rapidapi.com/
  2. Faça login/cadastro
  3. Procure por "Yahoo Finance"
  4. Inscreva-se na API (geralmente gratuita)
  5. Copie sua chave

### **3. ALPHA_VANTAGE_KEY** ⚪ **OPCIONAL**
- **Site**: https://www.alphavantage.co/
- **Plano Gratuito**: 500 requests/dia
- **Para que serve**: Indicadores adicionais de mercado
- **Como obter**:
  1. Acesse https://www.alphavantage.co/
  2. Clique em "Get Your Free API Key Today"
  3. Preencha o formulário
  4. Copie sua chave

### **4. TRADINGECONOMICS_KEY** ⚪ **OPCIONAL**
- **Site**: https://tradingeconomics.com/
- **Plano Gratuito**: Limitado
- **Para que serve**: Eventos econômicos e calendário
- **Como obter**:
  1. Acesse https://tradingeconomics.com/
  2. Vá em "API" no menu
  3. Faça cadastro
  4. Copie sua chave

### **5. FRED_API_KEY** ⚪ **OPCIONAL**
- **Site**: https://fred.stlouisfed.org/
- **Plano Gratuito**: Ilimitado
- **Para que serve**: Dados econômicos dos EUA
- **Como obter**:
  1. Acesse https://fred.stlouisfed.org/
  2. Clique em "API Keys" no menu
  3. Faça login/cadastro
  4. Copie sua chave

## 🛠️ **Como Configurar**

### **Passo 1: Editar o arquivo .env**
```bash
# Abra o arquivo .env em um editor
nano .env
# ou
code .env
# ou
vim .env
```

### **Passo 2: Substituir as chaves**
```bash
# Substitua estas linhas:
NEWS_API_KEY=your_news_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
ALPHA_VANTAGE_KEY=your_alpha_vantage_key_here
TRADINGECONOMICS_KEY=your_tradingeconomics_key_here
FRED_API_KEY=your_fred_api_key_here

# Por suas chaves reais:
NEWS_API_KEY=abc123def456ghi789
RAPIDAPI_KEY=xyz789abc123def456
ALPHA_VANTAGE_KEY=def456ghi789abc123
TRADINGECONOMICS_KEY=ghi789abc123def456
FRED_API_KEY=abc123def456ghi789
```

### **Passo 3: Salvar e testar**
```bash
# Salve o arquivo .env
# Execute o servidor
pnpm dev

# Em outro terminal, teste o sistema
npm run test:logging
```

## 🚀 **Testando as Chaves**

### **Teste Individual das APIs**
```bash
# Teste NewsAPI
curl "http://localhost:3000/api/news?category=usd-brl&lang=pt&pageSize=3"

# Teste Market API
curl "http://localhost:3000/api/market"

# Teste Events API
curl "http://localhost:3000/api/events"

# Teste Score API
curl "http://localhost:3000/api/score"
```

### **Verificar Logs**
```bash
# Os logs aparecerão no console
# Se configurado para arquivo, verifique ./logs/api.log
```

## ⚠️ **Importante**

### **Segurança**
- ✅ **NUNCA** commite o arquivo `.env` no Git
- ✅ Use `.env.local` para configurações locais
- ✅ Configure as variáveis no Vercel para produção

### **Fallbacks**
- 🔄 O projeto tem dados mock implementados
- 🔄 Funcionará mesmo sem todas as chaves
- 🔄 Qualidade dos dados depende das chaves configuradas

### **Limites das APIs**
- 📊 **NewsAPI**: 1,000 requests/dia
- 📊 **RapidAPI**: 500 requests/mês
- 📊 **Alpha Vantage**: 500 requests/dia
- 📊 **Trading Economics**: Limitado
- 📊 **FRED**: Ilimitado

## 🎯 **Configuração Mínima para Funcionar**

Para o projeto funcionar com dados reais, você precisa **APENAS** de:
1. **NEWS_API_KEY** - Para notícias
2. **RAPIDAPI_KEY** - Para cotações

As outras são opcionais e melhoram a experiência.

## 🔍 **Verificando se Funcionou**

### **Indicadores de Sucesso**
- ✅ Notícias aparecem com fontes reais (não "Mock")
- ✅ Cotações mostram valores atuais (não valores fixos)
- ✅ Logs mostram "Provider: NewsAPI" e "Provider: Yahoo Finance"
- ✅ Sem erros de "API key invalid" nos logs

### **Indicadores de Problema**
- ❌ Notícias mostram "Mock" como fonte
- ❌ Cotações mostram valores fixos (5.35, 103.2, etc.)
- ❌ Logs mostram erros de API
- ❌ Mensagens de "Rate limit exceeded"

## 🆘 **Solução de Problemas**

### **Erro: "API key invalid"**
- Verifique se a chave está correta
- Confirme se a API está ativa
- Verifique os limites de uso

### **Erro: "Rate limit exceeded"**
- Aguarde o reset do limite
- Considere upgrade do plano
- Use dados mock temporariamente

### **Erro: "Network error"**
- Verifique sua conexão com internet
- Confirme se as APIs estão online
- Verifique firewall/proxy

## 📞 **Suporte**

Se tiver problemas:
1. Verifique os logs do console
2. Confirme se as chaves estão corretas
3. Teste as APIs individualmente
4. Verifique os limites de uso

---

**🎉 Após configurar, execute `pnpm dev` e acesse http://localhost:3000**