# Radar Econômico USD/BRL - Dashboard Financeiro

Um dashboard web completo para análise de indicadores financeiros e econômicos que influenciam a relação USD/BRL, com cálculo automático de score e visualizações interativas.

## 🚀 Funcionalidades Principais

### 📊 Cálculo Automático de Score
O sistema aplica pesos automáticos baseados nos seguintes indicadores:

- **DXY subindo** → +2 pontos (Compra)
- **Juros EUA subindo** → +1.5 pontos (Compra)
- **Juros Brasil caindo** → +1.5 pontos (Compra)
- **VIX acima de 20** → +1 ponto (Compra)
- **Fluxo cambial negativo** → +2 pontos (Compra)
- **Dados positivos EUA** → +1.5 pontos (Compra)
- **Dados positivos Brasil** → -1.5 pontos (Venda)
- **Selic estável/subindo** → -2 pontos (Venda)
- **Exportações em alta** → -1 ponto (Venda)

### 🎯 Interpretação do Score
- **+3 ou mais** → Compra clara (🚀)
- **+1 a +2.9** → Viés comprador (📈)
- **-0.9 a +0.9** → Neutro (➖)
- **-1 a -2.9** → Viés vendedor (🔻)
- **-3 ou menos** → Venda clara (📉)

### 📈 Gráfico de Tendência Interativo
- **Linha verde** = Viés comprador (score positivo)
- **Linha vermelha** = Viés vendedor (score negativo)
- **Linha cinza** = Neutralidade (score 0)
- **Linhas pontilhadas** = Limites de compra/venda clara (±3)
- **Preenchimento colorido** para melhor visualização
- **Tooltips informativos** com detalhes do score

### 📅 Seleção de Data para Histórico
- Visualização de scores de dias específicos
- Filtro por data para análise histórica
- Histórico completo dos últimos 30 dias
- Botão para limpar filtros e voltar à visão geral

### 📊 Estatísticas Detalhadas
- **Visão Geral**: Total de dias, score médio, volatilidade
- **Distribuição**: Percentual de dias positivos, negativos e neutros
- **Extremos**: Scores máximo e mínimo, dias de compra/venda clara
- **Tendências**: Comparação semanal, direção da tendência, sequências
- **Gráfico de barras** para distribuição visual dos scores

### ⚠️ Sistema de Alertas Inteligente
- **Mudanças bruscas** de score (variação ≥ 2 pontos)
- **Tendências consecutivas** (3+ dias na mesma direção)
- **Sinais extremos** (score ≥ 4 ou ≤ -4)
- **Possíveis reversões** de tendência
- **Alta volatilidade** do mercado

### 💹 Painel de Mercado em Tempo Real
- **USD/BRL**: Cotação atual e variação percentual
- **DXY**: Índice do dólar
- **US 10Y**: Taxa de juros dos EUA
- **VIX**: Índice de volatilidade
- Cores dinâmicas baseadas na direção das variações

### 📰 Notícias e Eventos
- **Notícias em tempo real** com links para fontes
- **Próximos eventos** econômicos com contadores
- **Atualização automática** a cada minuto

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: Tailwind CSS com design responsivo
- **Gráficos**: Chart.js com react-chartjs-2
- **Gerenciamento de Estado**: SWR para cache e atualizações
- **Manipulação de Datas**: Luxon
- **Validação**: Zod
- **Cache**: Node-cache para otimização de performance

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Instalação
```bash
# Clonar o repositório
git clone <repository-url>
cd radar-economico-usdbrl

# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm dev
```

### Build de Produção
```bash
# Construir para produção
pnpm build

# Executar em produção
pnpm start
```

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona perfeitamente em:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Layout adaptado com grid responsivo
- **Mobile**: Layout otimizado para telas pequenas

## 🔄 Atualizações Automáticas

- **Score**: Atualiza a cada 1 minuto
- **Dados de mercado**: Atualiza a cada 1 minuto
- **Notícias**: Atualiza a cada 1 minuto
- **Eventos**: Atualiza a cada 1 minuto
- **Relógio**: Atualiza a cada segundo

## 🎨 Design e UX

- **Interface moderna** com cards arredondados e sombras
- **Cores semânticas** para diferentes tipos de score
- **Animações suaves** para transições e hover effects
- **Ícones intuitivos** para melhor compreensão
- **Tipografia hierárquica** para fácil leitura
- **Espaçamento consistente** seguindo princípios de design

## 📊 Estrutura dos Dados

### Score Entry
```typescript
type ScoreEntry = {
  date: string;           // Data ISO
  score: number;          // Score calculado (-5 a +5)
  label: string;          // Rótulo para exibição
  bias: string;           // Viés: 'Forte Compra' | 'Compra' | 'Neutro' | 'Venda' | 'Forte Venda'
  brief: string;          // Descrição resumida
  factors: string[];      // Lista de fatores que influenciaram
};
```

## 🔧 Configuração

O sistema utiliza APIs configuráveis para:
- Dados de mercado (cotações, variações)
- Dados macroeconômicos (juros, fluxo cambial)
- Notícias financeiras
- Eventos econômicos

## 📈 Roadmap

- [ ] Exportação de dados para CSV/Excel
- [ ] Alertas por email/notificações push
- [ ] Comparação com outros pares de moedas
- [ ] Backtesting de estratégias
- [ ] Integração com APIs de corretoras
- [ ] Dashboard administrativo para configurações

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório ou entre em contato através dos canais disponíveis.

---

**Desenvolvido com ❤️ para a comunidade financeira brasileira**