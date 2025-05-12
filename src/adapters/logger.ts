
/**
 * Logger implementation for the application
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerOptions {
  level?: LogLevel;
  context?: Record<string, any>;
  service?: string;
}

export class Logger {
  private context: Record<string, any>;
  private service: string;
  private level: LogLevel; // Renamed from logLevel

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.context = options.context || {};
    this.service = options.service || 'allora-os';
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Log at info level
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Log at error level
   */
  error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  /**
   * Log at fatal level
   */
  fatal(message: string, error?: any): void {
    this.log('fatal', message, error);
  }

  /**
   * Internal logging implementation
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // Only log if the level is appropriate based on this.level
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      service: this.service,
      context: this.context,
      data: data || null,
    };

    // In production, this would be sent to a proper logging service
    // For now, just use console with appropriate level
    switch (level) {
      case 'debug':
        console.debug(message, logEntry);
        break;
      case 'info':
        console.info(message, logEntry);
        break;
      case 'warn':
        console.warn(message, logEntry);
        break;
      case 'error':
      case 'fatal':
        console.error(message, logEntry);
        break;
      default:
        console.log(message, logEntry);
    }
  }
  
  /**
   * Determine if a message at the given level should be logged
   */
  private shouldLog(messageLevel: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    };
    
    return levels[messageLevel] >= levels[this.level];
  }
}

// Export a default logger instance
export const logger = new Logger();
