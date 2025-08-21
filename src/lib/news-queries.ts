export interface NewsQueryConfig {
  language: 'pt' | 'en' | 'es';
  query: string;
  description: string;
  keywords: string[];
}

export interface NewsQuerySet {
  primary: NewsQueryConfig;
  secondary: NewsQueryConfig[];
  fallback: NewsQueryConfig;
}

export const NEWS_QUERIES: Record<string, NewsQuerySet> = {
  'usd-brl': {
    primary: {
      language: 'pt',
      query: '(USD OR dólar OR "US Dollar") AND (Brasil OR BRL OR real OR economia OR "exchange rate" OR "taxa de câmbio")',
      description: 'Notícias sobre USD/BRL em português',
      keywords: ['USD', 'dólar', 'Brasil', 'BRL', 'real', 'economia', 'câmbio']
    },
    secondary: [
      {
        language: 'en',
        query: '(USD OR "US Dollar") AND (Brazil OR BRL OR real OR economy OR "exchange rate" OR forex)',
        description: 'USD/BRL news in English',
        keywords: ['USD', 'US Dollar', 'Brazil', 'BRL', 'real', 'economy', 'forex']
      },
      {
        language: 'es',
        query: '(USD OR "dólar estadounidense") AND (Brasil OR BRL OR real OR economía OR "tipo de cambio" OR forex)',
        description: 'Noticias sobre USD/BRL en español',
        keywords: ['USD', 'dólar estadounidense', 'Brasil', 'BRL', 'real', 'economía', 'forex']
      }
    ],
    fallback: {
      language: 'pt',
      query: 'Brasil economia',
      description: 'Fallback para notícias gerais do Brasil',
      keywords: ['Brasil', 'economia']
    }
  },
  
  'global-markets': {
    primary: {
      language: 'en',
      query: '("global markets" OR "financial markets" OR forex OR "currency markets") AND (USD OR "US Dollar" OR "emerging markets")',
      description: 'Global financial markets news in English',
      keywords: ['global markets', 'financial markets', 'forex', 'USD', 'emerging markets']
    },
    secondary: [
      {
        language: 'pt',
        query: '("mercados globais" OR "mercados financeiros" OR forex OR "mercados de moedas") AND (USD OR "dólar americano" OR "mercados emergentes")',
        description: 'Notícias sobre mercados financeiros globais em português',
        keywords: ['mercados globais', 'mercados financeiros', 'forex', 'USD', 'mercados emergentes']
      },
      {
        language: 'es',
        query: '("mercados globales" OR "mercados financieros" OR forex OR "mercados de divisas") AND (USD OR "dólar estadounidense" OR "mercados emergentes")',
        description: 'Noticias sobre mercados financieros globales en español',
        keywords: ['mercados globales', 'mercados financieros', 'forex', 'USD', 'mercados emergentes']
      }
    ],
    fallback: {
      language: 'en',
      query: 'markets finance',
      description: 'Fallback for general financial markets',
      keywords: ['markets', 'finance']
    }
  },
  
  'emerging-markets': {
    primary: {
      language: 'en',
      query: '("emerging markets" OR "developing economies") AND (currency OR forex OR USD OR "exchange rates")',
      description: 'Emerging markets news in English',
      keywords: ['emerging markets', 'developing economies', 'currency', 'forex', 'USD']
    },
    secondary: [
      {
        language: 'pt',
        query: '("mercados emergentes" OR "economias em desenvolvimento") AND (moeda OR forex OR USD OR "taxas de câmbio")',
        description: 'Notícias sobre mercados emergentes em português',
        keywords: ['mercados emergentes', 'economias em desenvolvimento', 'moeda', 'forex', 'USD']
      },
      {
        language: 'es',
        query: '("mercados emergentes" OR "economías en desarrollo") AND (moneda OR forex OR USD OR "tipos de cambio")',
        description: 'Noticias sobre mercados emergentes en español',
        keywords: ['mercados emergentes', 'economías en desarrollo', 'moneda', 'forex', 'USD']
      }
    ],
    fallback: {
      language: 'en',
      query: 'emerging markets',
      description: 'Fallback for emerging markets',
      keywords: ['emerging markets']
    }
  },
  
  'commodities': {
    primary: {
      language: 'en',
      query: '(oil OR gold OR silver OR copper OR "commodity prices") AND (USD OR "US Dollar" OR "global markets")',
      description: 'Commodities news in English',
      keywords: ['oil', 'gold', 'silver', 'copper', 'commodity prices', 'USD']
    },
    secondary: [
      {
        language: 'pt',
        query: '(petróleo OR ouro OR prata OR cobre OR "preços de commodities") AND (USD OR "dólar americano" OR "mercados globais")',
        description: 'Notícias sobre commodities em português',
        keywords: ['petróleo', 'ouro', 'prata', 'cobre', 'preços de commodities', 'USD']
      },
      {
        language: 'es',
        query: '(petróleo OR oro OR plata OR cobre OR "precios de materias primas") AND (USD OR "dólar estadounidense" OR "mercados globales")',
        description: 'Noticias sobre materias primas en español',
        keywords: ['petróleo', 'oro', 'plata', 'cobre', 'precios de materias primas', 'USD']
      }
    ],
    fallback: {
      language: 'en',
      query: 'commodities',
      description: 'Fallback for commodities',
      keywords: ['commodities']
    }
  },
  
  'central-banks': {
    primary: {
      language: 'en',
      query: '("Federal Reserve" OR "ECB" OR "Bank of England" OR "Banco Central") AND (interest rates OR monetary policy OR USD)',
      description: 'Central banks news in English',
      keywords: ['Federal Reserve', 'ECB', 'Bank of England', 'Banco Central', 'interest rates', 'monetary policy']
    },
    secondary: [
      {
        language: 'pt',
        query: '("Federal Reserve" OR "BCE" OR "Banco da Inglaterra" OR "Banco Central") AND ("taxa de juros" OR "política monetária" OR USD)',
        description: 'Notícias sobre bancos centrais em português',
        keywords: ['Federal Reserve', 'BCE', 'Banco da Inglaterra', 'Banco Central', 'taxa de juros', 'política monetária']
      },
      {
        language: 'es',
        query: '("Federal Reserve" OR "BCE" OR "Banco de Inglaterra" OR "Banco Central") AND ("tasa de interés" OR "política monetaria" OR USD)',
        description: 'Noticias sobre bancos centrales en español',
        keywords: ['Federal Reserve', 'BCE', 'Banco de Inglaterra', 'Banco Central', 'tasa de interés', 'política monetaria']
      }
    ],
    fallback: {
      language: 'en',
      query: 'Federal Reserve',
      description: 'Fallback for central banks',
      keywords: ['Federal Reserve']
    }
  }
};

export function getNewsQueries(category: string = 'usd-brl'): NewsQuerySet {
  return NEWS_QUERIES[category] || NEWS_QUERIES['usd-brl'];
}

export function getQueryForLanguage(category: string, language: 'pt' | 'en' | 'es'): NewsQueryConfig {
  const querySet = getNewsQueries(category);
  
  if (querySet.primary.language === language) {
    return querySet.primary;
  }
  
  const secondary = querySet.secondary.find(q => q.language === language);
  if (secondary) {
    return secondary;
  }
  
  return querySet.fallback;
}

export function getAllLanguagesForCategory(category: string): ('pt' | 'en' | 'es')[] {
  const querySet = getNewsQueries(category);
  const languages = [querySet.primary.language];
  
  querySet.secondary.forEach(q => {
    if (!languages.includes(q.language)) {
      languages.push(q.language);
    }
  });
  
  return languages;
}

export function getExpandedQuery(category: string, language: 'pt' | 'en' | 'es'): string {
  const config = getQueryForLanguage(category, language);
  
  // Expandir query com sinônimos e termos relacionados
  const expandedTerms = {
    'usd-brl': {
      'pt': [
        'USD OR dólar OR "dólar americano" OR "dólar dos EUA"',
        'Brasil OR "Brasil" OR "República Federativa do Brasil"',
        'BRL OR real OR "real brasileiro"',
        'economia OR "economia brasileira" OR "mercado financeiro"',
        '"taxa de câmbio" OR câmbio OR "paridade cambial" OR "cotação do dólar"'
      ],
      'en': [
        'USD OR "US Dollar" OR "American Dollar" OR "greenback"',
        'Brazil OR "Brazilian" OR "Federative Republic of Brazil"',
        'BRL OR real OR "Brazilian real"',
        'economy OR "Brazilian economy" OR "financial market"',
        '"exchange rate" OR forex OR "currency pair" OR "dollar quote"'
      ],
      'es': [
        'USD OR "dólar estadounidense" OR "dólar americano" OR "verde"',
        'Brasil OR "brasileño" OR "República Federativa de Brasil"',
        'BRL OR real OR "real brasileño"',
        'economía OR "economía brasileña" OR "mercado financiero"',
        '"tipo de cambio" OR forex OR "par de divisas" OR "cotización del dólar"'
      ]
    }
  };
  
  const expanded = expandedTerms[category as keyof typeof expandedTerms];
  if (expanded && expanded[language]) {
    return expanded[language].join(' AND ');
  }
  
  return config.query;
}