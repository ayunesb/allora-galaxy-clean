
/**
 * Error type definitions for the application
 */

export type ErrorSource = 'client' | 'server' | 'edge' | 'database';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Base error class that all other errors extend
export class AlloraError extends Error {
  public code: string;
  public context?: Record<string, any>;
  public severity: ErrorSeverity;
  public userMessage: string;
  public timestamp: string;
  public source: ErrorSource;
  public retry?: boolean;
  public retryCount?: number;
  public maxRetries?: number;
  public status?: number;
  public requestId?: string;

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
    status,
    requestId,
  }: {
    message: string;
    code?: string;
    context?: Record<string, any>;
    severity?: ErrorSeverity;
    userMessage?: string;
    source?: ErrorSource;
    retry?: boolean;
    retryCount?: number;
    maxRetries?: number;
    status?: number;
    requestId?: string;
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
    this.status = status;
    this.requestId = requestId;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  // Add serialization method for error transmission
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
      source: this.source,
      retry: this.retry,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      status: this.status,
      requestId: this.requestId,
      // Don't include stack in production for security reasons
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
      // Sanitize context to ensure it can be serialized
      context: this.context ? JSON.parse(JSON.stringify(this.context)) : undefined,
    };
  }

  // Create AlloraError from serialized object
  static fromJSON(json: Record<string, any>): AlloraError {
    const error = new AlloraError({
      message: json.message,
      code: json.code,
      severity: json.severity as ErrorSeverity,
      userMessage: json.userMessage,
      source: json.source as ErrorSource,
      retry: json.retry,
      retryCount: json.retryCount,
      maxRetries: json.maxRetries,
      status: json.status,
      requestId: json.requestId,
      context: json.context,
    });
    
    if (json.stack && process.env.NODE_ENV === 'development') {
      error.stack = json.stack;
    }
    
    return error;
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
      status: opts.status || 503,
      requestId: opts.requestId,
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
      status: opts.status || 401,
      requestId: opts.requestId,
    });
  }
}

// API errors
export class ApiError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
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
      status: opts.status || 500,
      requestId: opts.requestId,
    });
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
      status: opts.status || 500,
      requestId: opts.requestId,
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
      status: opts.status || 404,
      requestId: opts.requestId,
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
      status: opts.status || 400,
      requestId: opts.requestId,
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
      status: opts.status || 403,
      requestId: opts.requestId,
    });
  }
}

// Rate limit errors
export class RateLimitError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Rate limit exceeded',
      code: opts.code || 'RATE_LIMIT_EXCEEDED',
      severity: opts.severity || 'medium',
      userMessage: opts.userMessage || 'You have made too many requests. Please try again later.',
      source: opts.source || 'server',
      context: opts.context,
      retry: true,
      status: opts.status || 429,
      requestId: opts.requestId,
    });
  }
}

// Timeout errors
export class TimeoutError extends AlloraError {
  constructor(opts: Partial<ConstructorParameters<typeof AlloraError>[0]> = {}) {
    super({
      message: opts.message || 'Request timed out',
      code: opts.code || 'REQUEST_TIMEOUT',
      severity: opts.severity || 'medium',
      userMessage: opts.userMessage || 'The server took too long to respond. Please try again.',
      source: opts.source || 'client',
      context: opts.context,
      retry: true,
      status: opts.status || 408,
      requestId: opts.requestId,
    });
  }
}
