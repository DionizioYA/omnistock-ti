export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export class Logger {
  private static formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  public static info(message: string, meta?: any): void {
    console.log(Logger.formatMessage(LogLevel.INFO, message, meta));
  }

  public static warn(message: string, meta?: any): void {
    console.warn(Logger.formatMessage(LogLevel.WARN, message, meta));
  }

  public static error(message: string, error?: any): void {
    const errMeta = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
    console.error(Logger.formatMessage(LogLevel.ERROR, message, errMeta));
  }

  public static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(Logger.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}
