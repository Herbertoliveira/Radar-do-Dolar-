# 🚀 Demonstração do Dashboard Financeiro USD/BRL

## ✨ Funcionalidades Implementadas

### 1. 📊 Cálculo Automático de Score
O sistema calcula automaticamente um score de -5 a +5 baseado nos seguintes indicadores:

| Indicador | Peso | Ação |
|-----------|------|------|
| DXY subindo | +2 | Compra |
| Juros EUA subindo | +1.5 | Compra |
| Juros Brasil caindo | +1.5 | Compra |
| VIX acima de 20 | +1 | Compra |
| Fluxo cambial negativo | +2 | Compra |
| Dados positivos EUA | +1.5 | Compra |
| Dados positivos Brasil | -1.5 | Venda |
| Selic estável/subindo | -2 | Venda |
| Exportações em alta | -1 | Venda |

### 2. 🎯 Interpretação Visual do Score
- **🚀 Compra Clara**: Score ≥ +3 (Verde forte)
- **📈 Viés Comprador**: Score +1 a +2.9 (Verde)
- **➖ Neutro**: Score -0.9 a +0.9 (Cinza)
- **🔻 Viés Vendedor**: Score -1 a -2.9 (Vermelho)
- **📉 Venda Clara**: Score ≤ -3 (Vermelho forte)

### 3. 📈 Gráfico Interativo
- **Linhas coloridas** baseadas no score
- **Preenchimento** para melhor visualização
- **Tooltips informativos** com detalhes
- **Linhas de referência** para limites de compra/venda
- **Atualização automática** a cada minuto

### 4. 📅 Seleção de Data
- **Filtro por data** para análise histórica
- **Histórico de 30 dias** disponível
- **Botão de limpeza** para voltar à visão geral

### 5. 📊 Estatísticas Detalhadas
- **Visão Geral**: Total de dias, score médio, volatilidade
- **Distribuição**: Percentual de dias por categoria
- **Extremos**: Scores máximo e mínimo
- **Tendências**: Comparação semanal, direção, sequências
- **Gráfico de barras** para distribuição visual

### 6. ⚠️ Sistema de Alertas
- **Mudanças bruscas** de score
- **Tendências consecutivas**
- **Sinais extremos**
- **Possíveis reversões**
- **Alta volatilidade**

### 7. 💹 Painel de Mercado
- **USD/BRL**: Cotação e variação
- **DXY**: Índice do dólar
- **US 10Y**: Taxa de juros EUA
- **VIX**: Índice de volatilidade

## 🎮 Como Usar

### Acessando o Dashboard
1. Execute `pnpm dev` no terminal
2. Acesse `http://localhost:3000` no navegador
3. O dashboard carregará automaticamente

### Navegando pelas Funcionalidades

#### 📊 Score do Dia
- **Posição superior direita** mostra o score atual
- **Cores dinâmicas** baseadas no valor
- **Ícones intuitivos** para cada categoria
- **Descrição resumida** das condições

#### 📈 Gráfico de Tendência
- **Clique e arraste** para zoom
- **Hover** sobre pontos para detalhes
- **Legenda interativa** no topo
- **Seletor de data** para histórico específico

#### 📅 Seleção de Data
1. Clique em **"Selecionar Data"**
2. Escolha uma data específica
3. Visualize scores daquele dia
4. Clique em **"Limpar"** para voltar ao histórico completo

#### 📊 Estatísticas
- **4 seções** com informações detalhadas
- **Gráfico de barras** para distribuição
- **Métricas calculadas** automaticamente
- **Comparações temporais** semanais

#### ⚠️ Alertas
- **Verificação automática** de padrões
- **Categorização por tipo** (info, warning, success, danger)
- **Explicações detalhadas** de cada alerta
- **Atualização em tempo real**

## 🔧 Configuração

### APIs Necessárias
O sistema utiliza as seguintes APIs (configuráveis em `/configuracoes`):
- **RapidAPI** (Yahoo Finance)
- **Alpha Vantage**
- **FRED API**
- **Trading Economics**
- **News API**

### Fallbacks
- **Dados mock** disponíveis para demonstração
- **Cache inteligente** para otimização
- **Tratamento de erros** robusto

## 📱 Responsividade

### Desktop
- **Layout completo** com todas as funcionalidades
- **Gráficos grandes** para análise detalhada
- **Grid de 4 colunas** para estatísticas

### Tablet
- **Layout adaptado** com grid responsivo
- **Gráficos médios** para visualização adequada
- **Grid de 2 colunas** para estatísticas

### Mobile
- **Layout otimizado** para telas pequenas
- **Gráficos compactos** para visualização
- **Grid de 1 coluna** para estatísticas

## 🔄 Atualizações

### Frequência
- **Score**: A cada 1 minuto
- **Mercado**: A cada 1 minuto
- **Notícias**: A cada 1 minuto
- **Eventos**: A cada 1 minuto
- **Relógio**: A cada segundo

### Indicadores Visuais
- **Loading states** durante atualizações
- **Animações suaves** para transições
- **Feedback visual** para mudanças

## 🎨 Design e UX

### Cores Semânticas
- **Verde**: Scores positivos (compra)
- **Vermelho**: Scores negativos (venda)
- **Azul**: Informações neutras
- **Amarelo**: Alertas e avisos

### Animações
- **Fade in** para elementos
- **Hover effects** para interatividade
- **Transições suaves** para mudanças
- **Loading states** para feedback

### Tipografia
- **Hierarquia clara** de informações
- **Fontes legíveis** para todos os dispositivos
- **Espaçamento consistente** entre elementos

## 🚀 Próximos Passos

### Funcionalidades Planejadas
- [ ] **Exportação de dados** para CSV/Excel
- [ ] **Alertas por email** e notificações push
- [ ] **Comparação com outros pares** de moedas
- [ ] **Backtesting de estratégias** baseadas no score
- [ ] **Integração com corretoras** para execução automática
- [ ] **Dashboard administrativo** para configurações avançadas

### Melhorias Técnicas
- [ ] **PWA** para instalação como app
- [ ] **Offline mode** com cache local
- [ ] **WebSocket** para atualizações em tempo real
- [ ] **Machine Learning** para previsões de score

## 💡 Dicas de Uso

### Para Traders
- **Monitore o score** diariamente
- **Analise tendências** semanais
- **Use alertas** para mudanças importantes
- **Compare com dados** de mercado

### Para Analistas
- **Estude estatísticas** detalhadas
- **Analise padrões** históricos
- **Identifique correlações** entre indicadores
- **Use filtros de data** para períodos específicos

### Para Investidores
- **Entenda o viés** geral do mercado
- **Monitore mudanças** bruscas
- **Use como complemento** à análise fundamental
- **Considere o contexto** macroeconômico

## 🔍 Troubleshooting

### Problemas Comuns

#### Dashboard não carrega
- Verifique se o servidor está rodando (`pnpm dev`)
- Confirme a porta 3000 está livre
- Verifique logs do terminal

#### Dados não atualizam
- Confirme APIs estão configuradas
- Verifique conexão com internet
- Aguarde próximo ciclo de atualização (1 minuto)

#### Gráfico não exibe
- Verifique se há dados no histórico
- Confirme Chart.js está carregado
- Verifique console do navegador para erros

### Logs e Debug
- **Terminal**: Logs do servidor Next.js
- **Console do navegador**: Erros JavaScript
- **Network tab**: Requisições de API
- **API endpoints**: Teste direto das rotas

---

**🎯 Dashboard pronto para uso! Acesse http://localhost:3000 e comece a analisar os indicadores financeiros.**