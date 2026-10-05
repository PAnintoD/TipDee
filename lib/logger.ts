// ==============================================================================
// TIPDEE STRUCTURED LOGGER (Production Observability & Tracing)
// ==============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  traceId?: string;
  userId?: string;
  streamerId?: string;
  path?: string;
  ip?: string;
  [key: string]: any;
}

class StructuredLogger {
  private defaultContext: LogContext = {};

  constructor(context: LogContext = {}) {
    this.defaultContext = context;
  }

  public withContext(context: LogContext): StructuredLogger {
    return new StructuredLogger({
      ...this.defaultContext,
      ...context,
    });
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    const timestamp = new Date().toISOString();

    const payload = {
      timestamp,
      level,
      message,
      ...this.defaultContext,
      ...(meta && typeof meta === 'object' ? meta : meta ? { data: meta } : {}),
    };

    if (isProduction) {
      // In production, emit single-line JSON for Datadog, CloudWatch, Loki, or Papertrail
      const jsonLine = JSON.stringify(payload);
      if (level === 'error') {
        console.error(jsonLine);
      } else if (level === 'warn') {
        console.warn(jsonLine);
      } else {
        console.log(jsonLine);
      }
    } else {
      // In development, pretty format for human terminal reading
      const prefix = `[${timestamp.slice(11, 19)}] [${level.toUpperCase()}]`;
      const color =
        level === 'error'
          ? '\x1b[31m'
          : level === 'warn'
          ? '\x1b[33m'
          : level === 'info'
          ? '\x1b[32m'
          : '\x1b[36m';
      const reset = '\x1b[0m';

      const contextStr = Object.keys(this.defaultContext).length > 0
        ? ` (${JSON.stringify(this.defaultContext)})`
        : '';

      if (level === 'error') {
        console.error(`${color}${prefix}${reset} ${message}${contextStr}`, meta || '');
      } else if (level === 'warn') {
        console.warn(`${color}${prefix}${reset} ${message}${contextStr}`, meta || '');
      } else {
        console.log(`${color}${prefix}${reset} ${message}${contextStr}`, meta || '');
      }
    }
  }

  public debug(message: string, meta?: any) {
    if (process.env.DEBUG || process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }

  public info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: any) {
    this.log('error', message, meta);
  }
}

export const logger = new StructuredLogger();
