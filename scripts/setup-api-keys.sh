#!/bin/bash

# Script para configurar chaves de API
# Execute: bash scripts/setup-api-keys.sh

echo "🔑 Configuração das Chaves de API"
echo "=================================="
echo ""

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Execute primeiro: cp .env.example .env"
    exit 1
fi

echo "📝 Editando arquivo .env..."
echo ""

# Função para solicitar chave
ask_for_key() {
    local key_name=$1
    local description=$2
    local url=$3
    
    echo "🔑 $key_name"
    echo "   $description"
    echo "   Obtenha em: $url"
    echo ""
    read -p "Digite sua chave (ou pressione Enter para pular): " key_value
    
    if [ ! -z "$key_value" ]; then
        # Substituir no arquivo .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${key_name}=.*/${key_name}=${key_value}/" .env
        else
            # Linux
            sed -i "s/^${key_name}=.*/${key_name}=${key_value}/" .env
        fi
        echo "✅ $key_name configurada!"
    else
        echo "⏭️  $key_name pulada"
    fi
    echo ""
}

# Solicitar cada chave
ask_for_key "NEWS_API_KEY" "Para notícias em tempo real (PT/EN/ES)" "https://newsapi.org/"
ask_for_key "RAPIDAPI_KEY" "Para Yahoo Finance (cotações)" "https://rapidapi.com/"
ask_for_key "ALPHA_VANTAGE_KEY" "Para indicadores adicionais" "https://www.alphavantage.co/"
ask_for_key "TRADINGECONOMICS_KEY" "Para eventos econômicos" "https://tradingeconomics.com/"
ask_for_key "FRED_API_KEY" "Para dados econômicos dos EUA" "https://fred.stlouisfed.org/"

echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: pnpm dev"
echo "2. Teste com: npm run test:logging"
echo "3. Acesse: http://localhost:3000"
echo ""
echo "🔍 Para verificar se funcionou:"
echo "- Notícias devem mostrar fontes reais (não 'Mock')"
echo "- Cotações devem mostrar valores atuais"
echo "- Logs devem mostrar 'Provider: NewsAPI' etc."
echo ""
echo "⚠️  Lembre-se: NUNCA commite o arquivo .env no Git!"