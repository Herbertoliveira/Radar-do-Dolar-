export interface LoggerConfig {
  // Níveis de log
  levels: {
    info: boolean;
    warn: boolean;
    error: boolean;
  };
  
  // Configurações de saída
  output: {
    console: boolean;
    file: boolean;
    filePath: string;
    maxFileSize: number; // em MB
    maxFiles: number;
  };
  
  // Configurações de mascaramento
  masking: {
    enabled: boolean;
    patterns: Array<{
      name: string;
      pattern: RegExp;
      replacement: string;
    }>;
  };
  
  // Configurações de performance
  performance: {
    logSlowRequests: boolean;
    slowRequestThreshold: number; // em ms
    logCacheHits: boolean;
    logCacheMisses: boolean;
  };
  
  // Configurações de contexto
  context: {
    includeUserAgent: boolean;
    includeIP: boolean;
    includeRequestId: boolean;
    includeTimestamp: boolean;
    includeDuration: boolean;
  };
  
  // Configurações de rotação de logs
  rotation: {
    enabled: boolean;
    interval: 'daily' | 'weekly' | 'monthly';
    compress: boolean;
    maxAge: number; // em dias
  };
}

export const defaultLoggerConfig: LoggerConfig = {
  levels: {
    info: true,
    warn: true,
    error: true,
  },
  
  output: {
    console: true,
    file: false,
    filePath: './logs/api.log',
    maxFileSize: 10, // 10MB
    maxFiles: 5,
  },
  
  masking: {
    enabled: true,
    patterns: [
      {
        name: 'API Keys',
        pattern: /api[_-]?key/i,
        replacement: '[API_KEY_MASKED]',
      },
      {
        name: 'RapidAPI Keys',
        pattern: /x-rapidapi-key/i,
        replacement: '[RAPIDAPI_KEY_MASKED]',
      },
      {
        name: 'Authorization',
        pattern: /authorization/i,
        replacement: '[AUTH_MASKED]',
      },
      {
        name: 'Tokens',
        pattern: /token/i,
        replacement: '[TOKEN_MASKED]',
      },
      {
        name: 'Passwords',
        pattern: /password/i,
        replacement: '[PASSWORD_MASKED]',
      },
      {
        name: 'Credit Cards',
        pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
        replacement: '[CARD_MASKED]',
      },
      {
        name: 'Emails',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
        replacement: '[EMAIL_MASKED]',
      },
      {
        name: 'Phone Numbers',
        pattern: /\b\+?[\d\s\-\(\)]{10,}\b/,
        replacement: '[PHONE_MASKED]',
      },
      {
        name: 'IP Addresses',
        pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
        replacement: '[IP_MASKED]',
      },
    ],
  },
  
  performance: {
    logSlowRequests: true,
    slowRequestThreshold: 1000, // 1 segundo
    logCacheHits: true,
    logCacheMisses: true,
  },
  
  context: {
    includeUserAgent: true,
    includeIP: true,
    includeRequestId: true,
    includeTimestamp: true,
    includeDuration: true,
  },
  
  rotation: {
    enabled: false,
    interval: 'daily',
    compress: true,
    maxAge: 30, // 30 dias
  },
};

// Função para carregar configuração do ambiente
export function loadLoggerConfig(): LoggerConfig {
  const config = { ...defaultLoggerConfig };
  
  // Carregar do ambiente
  if (process.env.LOG_LEVEL) {
    const levels = process.env.LOG_LEVEL.split(',').map(l => l.trim().toLowerCase());
    config.levels.info = levels.includes('info');
    config.levels.warn = levels.includes('warn');
    config.levels.error = levels.includes('error');
  }
  
  if (process.env.LOG_OUTPUT) {
    const outputs = process.env.LOG_OUTPUT.split(',').map(o => o.trim().toLowerCase());
    config.output.console = outputs.includes('console');
    config.output.file = outputs.includes('file');
  }
  
  if (process.env.LOG_FILE_PATH) {
    config.output.filePath = process.env.LOG_FILE_PATH;
  }
  
  if (process.env.LOG_MASKING_ENABLED) {
    config.masking.enabled = process.env.LOG_MASKING_ENABLED.toLowerCase() === 'true';
  }
  
  if (process.env.LOG_SLOW_REQUEST_THRESHOLD) {
    config.performance.slowRequestThreshold = parseInt(process.env.LOG_SLOW_REQUEST_THRESHOLD) || 1000;
  }
  
  return config;
}

// Função para validar configuração
export function validateLoggerConfig(config: LoggerConfig): string[] {
  const errors: string[] = [];
  
  if (config.output.file && !config.output.filePath) {
    errors.push('File path is required when file output is enabled');
  }
  
  if (config.performance.slowRequestThreshold < 0) {
    errors.push('Slow request threshold must be positive');
  }
  
  if (config.output.maxFileSize <= 0) {
    errors.push('Max file size must be positive');
  }
  
  if (config.output.maxFiles <= 0) {
    errors.push('Max files must be positive');
  }
  
  if (config.rotation.maxAge <= 0) {
    errors.push('Max age must be positive');
  }
  
  return errors;
}