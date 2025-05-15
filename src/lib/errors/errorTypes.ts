
/**
 * Error type definitions for the Allora OS error handling system
 * Defines a hierarchy of error types for different scenarios
 * 
 * @module errorTypes
 */

/**
 * Severity levels for errors
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Source of the error (where it originated)
 */
export type ErrorSource = 'client' | 'server' | 'database' | 'edge' | 'external' | 'unknown';

/**
 * Base interface for error initialization options
 */
export interface ErrorInitOptions {
  /** Human-readable error message */
  message: string;
  
  /** Optional error code */
  code?: string;
  
  /** Optional HTTP status code */
  status?: number;
  
  /** Additional context data for debugging */
  context?: Record<string, any>;
  
  /** User-friendly message to display */
  userMessage?: string;
  
  /** Where the error originated */
  source?: ErrorSource;
  
  /** Whether the operation can be retried */
  retry?: boolean;
  
  /** Severity level of the error */
  severity?: ErrorSeverity;
  
  /** Request ID for tracing */
  requestId?: string;
}

/**
 * Base error class for Allora OS
 * All specialized errors inherit from this class
 * 
 * @class AlloraError
 * @extends Error
 */
export class AlloraError extends Error {
  /** Error code for categorization */
  code: string;
  
  /** HTTP status code */
  status: number;
  
  /** Context data for debugging */
  context: Record<string, any>;
  
  /** User-friendly message that can be displayed in UI */
  userMessage: string;
  
  /** Where the error originated */
  source: ErrorSource;
  
  /** Whether the operation can be retried */
  retry: boolean;
  
  /** Error severity level */
  severity: ErrorSeverity;
  
  /** Timestamp when error occurred */
  timestamp: string;
  
  /** Request ID for tracing */
  requestId?: string;

  /**
   * Create a new AlloraError
   * 
   * @param {ErrorInitOptions} options - Error initialization options
   */
  constructor(options: ErrorInitOptions) {
    super(options.message);
    
    this.name = this.constructor.name;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.status = options.status || 500;
    this.context = options.context || {};
    this.userMessage = options.userMessage || options.message;
    this.source = options.source || 'unknown';
    this.retry = options.retry !== undefined ? options.retry : true;
    this.severity = options.severity || 'medium';
    this.timestamp = new Date().toISOString();
    this.requestId = options.requestId;
    
    // Ensure proper prototype chaining
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to JSON for serialization
   * 
   * @returns {Record<string, any>} JSON representation of the error
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      context: this.context,
      userMessage: this.userMessage,
      source: this.source,
      retry: this.retry,
      severity: this.severity,
      timestamp: this.timestamp,
      requestId: this.requestId
    };
  }

  /**
   * Create AlloraError from JSON representation
   * 
   * @param {Record<string, any>} json - JSON representation of the error
   * @returns {AlloraError} Reconstructed AlloraError instance
   */
  static fromJSON(json: Record<string, any>): AlloraError {
    const error = new AlloraError({
      message: json.message,
      code: json.code,
      status: json.status,
      context: json.context,
      userMessage: json.userMessage,
      source: json.source as ErrorSource,
      retry: json.retry,
      severity: json.severity as ErrorSeverity,
      requestId: json.requestId
    });
    
    error.timestamp = json.timestamp;
    return error;
  }
}

/**
 * API-related errors
 * 
 * @class ApiError
 * @extends AlloraError
 */
export class ApiError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'API_ERROR',
      source: options.source || 'server',
      severity: options.severity || 'medium'
    });
  }
}

/**
 * Authentication-related errors
 * 
 * @class AuthError
 * @extends AlloraError
 */
export class AuthError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'AUTH_ERROR',
      status: options.status || 401,
      source: options.source || 'client',
      severity: options.severity || 'high'
    });
  }
}

/**
 * Permission-related errors
 * 
 * @class PermissionError
 * @extends AlloraError
 */
export class PermissionError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'PERMISSION_ERROR',
      status: options.status || 403,
      source: options.source || 'server',
      severity: options.severity || 'high'
    });
  }
}

/**
 * Not found errors
 * 
 * @class NotFoundError
 * @extends AlloraError
 */
export class NotFoundError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'NOT_FOUND',
      status: options.status || 404,
      source: options.source || 'server',
      severity: options.severity || 'medium'
    });
  }
}

/**
 * Input validation errors
 * 
 * @class ValidationError
 * @extends AlloraError
 */
export class ValidationError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'VALIDATION_ERROR',
      status: options.status || 400,
      source: options.source || 'client',
      severity: options.severity || 'medium'
    });
  }
}

/**
 * Database-related errors
 * 
 * @class DatabaseError
 * @extends AlloraError
 */
export class DatabaseError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'DATABASE_ERROR',
      source: options.source || 'database',
      severity: options.severity || 'high'
    });
  }
}

/**
 * Network-related errors
 * 
 * @class NetworkError
 * @extends AlloraError
 */
export class NetworkError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'NETWORK_ERROR',
      source: options.source || 'client',
      severity: options.severity || 'medium',
      retry: options.retry !== undefined ? options.retry : true
    });
  }
}

/**
 * Configuration errors
 * 
 * @class ConfigError
 * @extends AlloraError
 */
export class ConfigError extends AlloraError {
  constructor(options: ErrorInitOptions) {
    super({
      ...options,
      code: options.code || 'CONFIG_ERROR',
      source: options.source || 'server',
      severity: options.severity || 'high',
      retry: options.retry !== undefined ? options.retry : false
    });
  }
}
