
/**
 * Error type definitions for the application
 */

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
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Determines if this error can be retried again
   */
  canRetry(): boolean {
    if (!this.retry) return false;
    return this.retryCount! < this.maxRetries!;
  }

  /**
   * Creates a new instance of this error with incremented retry count
   */
  incrementRetry(): AlloraError {
    return new AlloraError({
      message: this.message,
      code: this.code,
      context: this.context,
      severity: this.severity,
      userMessage: this.userMessage,
      source: this.source,
      retry: this.retry,
      retryCount: (this.retryCount || 0) + 1,
      maxRetries: this.maxRetries,
    });
  }
}

// Error source types
export type ErrorSource = 'client' | 'server' | 'edge' | 'database' | 'external';

// Network related errors
export class NetworkError extends AlloraError {
  constructor(params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code'> & { code?: string }) {
    super({
      ...params,
      code: params.code || 'NETWORK_ERROR',
      source: 'client',
      retry: true,
    });
  }
}

// API errors
export class ApiError extends AlloraError {
  public status: number;

  constructor(
    params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code' | 'source'> & 
    { code?: string; status?: number; source?: ErrorSource }
  ) {
    super({
      ...params,
      code: params.code || 'API_ERROR',
      source: params.source || 'server',
    });
    this.status = params.status || 500;
  }
}

// Database errors
export class DatabaseError extends AlloraError {
  constructor(params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code' | 'source'> & { code?: string }) {
    super({
      ...params,
      code: params.code || 'DATABASE_ERROR',
      source: 'database',
    });
  }
}

// Authentication errors
export class AuthError extends AlloraError {
  constructor(params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code'> & { code?: string }) {
    super({
      ...params,
      code: params.code || 'AUTH_ERROR',
      severity: 'high',
    });
  }
}

// Permission errors
export class PermissionError extends AlloraError {
  constructor(params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code' | 'severity'> & { code?: string }) {
    super({
      ...params,
      code: params.code || 'PERMISSION_DENIED',
      severity: 'high',
    });
  }
}

// Validation errors
export class ValidationError extends AlloraError {
  public fields?: Record<string, string>;

  constructor(
    params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code'> & 
    { code?: string; fields?: Record<string, string> }
  ) {
    super({
      ...params,
      code: params.code || 'VALIDATION_ERROR',
      severity: 'low',
    });
    this.fields = params.fields;
  }
}

// Not found errors
export class NotFoundError extends AlloraError {
  constructor(params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code' | 'severity'> & { code?: string }) {
    super({
      ...params,
      code: params.code || 'NOT_FOUND',
      severity: 'low',
    });
  }
}

// External service errors
export class ExternalServiceError extends AlloraError {
  public service: string;
  
  constructor(
    params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code' | 'source'> & 
    { code?: string; service: string }
  ) {
    super({
      ...params,
      code: params.code || 'EXTERNAL_SERVICE_ERROR',
      source: 'external',
      retry: true,
    });
    this.service = params.service;
  }
}

// Timeout errors
export class TimeoutError extends AlloraError {
  constructor(params: Omit<ConstructorParameters<typeof AlloraError>[0], 'code'> & { code?: string }) {
    super({
      ...params,
      code: params.code || 'TIMEOUT',
      retry: true,
    });
  }
}
