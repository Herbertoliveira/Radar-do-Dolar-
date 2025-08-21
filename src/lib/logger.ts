import { DateTime } from 'luxon';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  endpoint: string;
  method: string;
  requestId: string;
  duration?: number;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  requestData?: any;
  responseData?: any;
  error?: string;
  cacheHit?: boolean;
  apiProvider?: string;
}

export interface SensitiveDataMask {
  patterns: RegExp[];
  replacement: string;
}

class APILogger {
  private sensitivePatterns: SensitiveDataMask[] = [
    // API Keys
    { patterns: [/api[_-]?key/i, /x-rapidapi-key/i, /authorization/i], replacement: '[API_KEY_MASKED]' },
    // Tokens
    { patterns: [/token/i, /bearer/i], replacement: '[TOKEN_MASKED]' },
    // Passwords
    { patterns: [/password/i, /passwd/i, /pwd/i], replacement: '[PASSWORD_MASKED]' },
    // Credit card numbers
    { patterns: [/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/], replacement: '[CARD_MASKED]' },
    // Email addresses
    { patterns: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/], replacement: '[EMAIL_MASKED]' },
    // Phone numbers
    { patterns: [/\b\+?[\d\s\-\(\)]{10,}\b/], replacement: '[PHONE_MASKED]' },
    // IP addresses
    { patterns: [/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/], replacement: '[IP_MASKED]' },
  ];

  private maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      let masked = data;
      this.sensitivePatterns.forEach(({ patterns, replacement }) => {
        patterns.forEach(pattern => {
          if (pattern.test(masked)) {
            masked = masked.replace(pattern, replacement);
          }
        });
      });
      return masked;
    }
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.maskSensitiveData(item));
      }
      
      const masked: any = {};
      for (const [key, value] of Object.entries(data)) {
        const maskedKey = this.maskSensitiveData(key);
        const maskedValue = this.maskSensitiveData(value);
        masked[maskedKey] = maskedValue;
      }
      return masked;
    }
    
    return data;
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = DateTime.fromISO(entry.timestamp).toFormat('yyyy-MM-dd HH:mm:ss.SSS');
    const duration = entry.duration ? ` (${entry.duration}ms)` : '';
    const status = entry.statusCode ? ` [${entry.statusCode}]` : '';
    const cache = entry.cacheHit !== undefined ? ` [Cache: ${entry.cacheHit ? 'HIT' : 'MISS'}]` : '';
    
    let log = `[${timestamp}] ${entry.level.toUpperCase()} ${entry.method} ${entry.endpoint}${status}${duration}${cache}`;
    
    if (entry.requestId) {
      log += ` [ID: ${entry.requestId}]`;
    }
    
    if (entry.apiProvider) {
      log += ` [Provider: ${entry.apiProvider}]`;
    }
    
    if (entry.userAgent) {
      log += ` [UA: ${entry.userAgent.substring(0, 50)}...]`;
    }
    
    if (entry.ip) {
      log += ` [IP: ${entry.ip}]`;
    }
    
    if (entry.error) {
      log += `\n  Error: ${entry.error}`;
    }
    
    if (entry.requestData) {
      const maskedRequest = this.maskSensitiveData(entry.requestData);
      log += `\n  Request: ${JSON.stringify(maskedRequest, null, 2)}`;
    }
    
    if (entry.responseData) {
      const maskedResponse = this.maskSensitiveData(entry.responseData);
      // Limitar tamanho da resposta para evitar logs muito longos
      const responseStr = JSON.stringify(maskedResponse);
      if (responseStr.length > 1000) {
        log += `\n  Response: ${responseStr.substring(0, 1000)}... [truncated]`;
      } else {
        log += `\n  Response: ${responseStr}`;
      }
    }
    
    return log;
  }

  private writeToFile(entry: LogEntry): void {
    const logDir = '/var/log/api' || './logs';
    const filename = `${logDir}/api-${DateTime.now().toFormat('yyyy-MM-dd')}.log`;
    
    try {
      // Em produção, você pode usar fs.writeFileSync ou um sistema de logging mais robusto
      console.log(this.formatLogEntry(entry));
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  public log(entry: LogEntry): void {
    // Adicionar timestamp se não fornecido
    if (!entry.timestamp) {
      entry.timestamp = DateTime.now().toISO();
    }
    
    // Gerar requestId se não fornecido
    if (!entry.requestId) {
      entry.requestId = this.generateRequestId();
    }
    
    this.writeToFile(entry);
  }

  public info(endpoint: string, method: string, data: Partial<LogEntry> = {}): void {
    this.log({
      timestamp: DateTime.now().toISO(),
      level: 'info',
      endpoint,
      method,
      requestId: this.generateRequestId(),
      ...data,
    });
  }

  public warn(endpoint: string, method: string, data: Partial<LogEntry> = {}): void {
    this.log({
      timestamp: DateTime.now().toISO(),
      level: 'warn',
      endpoint,
      method,
      requestId: this.generateRequestId(),
      ...data,
    });
  }

  public error(endpoint: string, method: string, error: string, data: Partial<LogEntry> = {}): void {
    this.log({
      timestamp: DateTime.now().toISO(),
      level: 'error',
      endpoint,
      method,
      requestId: this.generateRequestId(),
      error,
      ...data,
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public createRequestLogger(endpoint: string, method: string) {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    return {
      requestId,
      logInfo: (data: Partial<LogEntry> = {}) => {
        this.info(endpoint, method, { ...data, requestId });
      },
      logWarn: (data: Partial<LogEntry> = {}) => {
        this.warn(endpoint, method, { ...data, requestId });
      },
      logError: (error: string, data: Partial<LogEntry> = {}) => {
        this.error(endpoint, method, error, { ...data, requestId });
      },
      logResponse: (statusCode: number, responseData: any, cacheHit: boolean = false, apiProvider?: string) => {
        const duration = Date.now() - startTime;
        this.info(endpoint, method, {
          requestId,
          statusCode,
          responseData,
          duration,
          cacheHit,
          apiProvider,
        });
      },
    };
  }
}

export const apiLogger = new APILogger();

// Middleware helper para Next.js API routes
export function withLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string,
  method: string
) {
  return async (...args: T): Promise<R> => {
    const logger = apiLogger.createRequestLogger(endpoint, method);
    const startTime = Date.now();
    
    try {
      logger.logInfo({ method, endpoint });
      
      const result = await handler(...args);
      
      const duration = Date.now() - startTime;
      logger.logResponse(200, result, false);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.logError(errorMessage, { duration });
      throw error;
    }
  };
}