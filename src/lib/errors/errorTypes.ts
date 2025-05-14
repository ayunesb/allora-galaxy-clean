
/**
 * Error type definitions for the application
 */

export type ErrorSource = 'client' | 'server' | 'edge' | 'database';

// Base error class that all other errors extend
export class AlloraError extends Error {
  public code: string;
  public context?: Record<string, any>;
  public severity: 'low' | 'medium' | 'high' | 'critical';
  public userMessage: string;
  public timestamp: string;
  public source: ErrorSource;
  public retry?: boolean;
  public retryCount?: number;
  public maxRetries?: number;

  constructor({
    message,
    code = 'UNKNOWN_ERROR',
    context = {},
    severity = 'medium',
    userMessage,
    source = 'client',
    retry = false,
    retryCount = 0,
    maxRetries = 3,
  }: {
    message: string;
    code?: string;
    context?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    userMessage?: string;
    source?: ErrorSource;
    retry?: boolean;
    retryCount?: number;
    maxRetries?: number;
  }) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.severity = severity;
    this.userMessage = userMessage || message;
    this.timestamp = new Date().toISOString();
    this.source = source;
    this.retry = retry;
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Network connectivity errors
export class NetworkError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Network connection failed',
      code: opts.code || 'NETWORK_ERROR',
      severity: opts.severity || 'medium',
      userMessage: opts.userMessage || 'Unable to connect to the server. Please check your internet connection.',
      source: opts.source || 'client',
      retry: opts.retry !== undefined ? opts.retry : true,
      context: opts.context,
      retryCount: opts.retryCount,
      maxRetries: opts.maxRetries,
    });
  }
}

// Authentication errors
export class AuthError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Authentication failed',
      code: opts.code || 'AUTH_ERROR',
      severity: opts.severity || 'high',
      userMessage: opts.userMessage || 'Authentication failed. Please sign in again.',
      source: opts.source || 'client',
      context: opts.context,
      retry: false, // Auth errors typically can't be automatically retried
    });
  }
}

// API errors
export class ApiError extends AlloraError {
  public status: number;
  
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> & { status?: number } = {}) {
    super({
      message: opts.message || 'API request failed',
      code: opts.code || 'API_ERROR',
      severity: opts.severity || 'medium',
      userMessage: opts.userMessage || 'The server encountered an error while processing your request.',
      source: opts.source || 'server',
      context: opts.context,
      retry: opts.retry !== undefined ? opts.retry : true,
      retryCount: opts.retryCount,
      maxRetries: opts.maxRetries,
    });
    
    this.status = opts.status || 500;
  }
}

// Database errors
export class DatabaseError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Database operation failed',
      code: opts.code || 'DB_ERROR',
      severity: opts.severity || 'high',
      userMessage: opts.userMessage || 'We encountered a database error. Our team has been notified.',
      source: opts.source || 'server',
      context: opts.context,
      retry: opts.retry !== undefined ? opts.retry : false,
    });
  }
}

// Not found errors
export class NotFoundError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Resource not found',
      code: opts.code || 'NOT_FOUND',
      severity: opts.severity || 'medium',
      userMessage: opts.userMessage || 'The requested resource could not be found.',
      source: opts.source || 'client',
      context: opts.context,
      retry: false,
    });
  }
}

// Validation errors
export class ValidationError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Validation failed',
      code: opts.code || 'VALIDATION_ERROR',
      severity: opts.severity || 'low',
      userMessage: opts.userMessage || 'Please check your input and try again.',
      source: opts.source || 'client',
      context: opts.context,
      retry: false,
    });
  }
}

// Permission errors
export class PermissionError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Permission denied',
      code: opts.code || 'PERMISSION_DENIED',
      severity: opts.severity || 'medium',
      userMessage: opts.userMessage || 'You do not have permission to perform this action.',
      source: opts.source || 'server',
      context: opts.context,
      retry: false,
    });
  }
}
