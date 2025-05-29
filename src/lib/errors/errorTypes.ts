/**
 * Error type definitions for the application's error handling system
 * Defines a hierarchy of error types for different scenarios
 *
 * @module errorTypes
 */

/**
 * Severity levels for errors, indicating business impact
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * Source of the error (where it originated)
 * - client: Browser/client-side errors
 * - server: API server errors
 * - database: Database operation errors
 * - edge: Edge function errors
 * - external: Third-party service errors
 * - unknown: Source couldn't be determined
 */
export type ErrorSource =
  | "client"
  | "server"
  | "database"
  | "edge"
  | "external"
  | "unknown";

/**
 * Base interface for error initialization options
 */
export interface ErrorInitOptions {
  /** Human-readable error message */
  message: string;

  /** Optional error code for categorization */
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
 * Base error class for the application
 * All specialized errors inherit from this class
 *
 * @class AlloraError
 * @extends Error
 * @example
 * ```typescript
 * // Creating a basic error
 * const error = new AlloraError({
 *   message: 'Failed to process request',
 *   code: 'PROCESS_ERROR',
 *   status: 500,
 *   severity: 'high'
 * });
 *
 * // Converting to JSON for logging or transmission
 * const errorJson = error.toJSON();
 *
 * // Reconstructing from JSON
 * const reconstructedError = AlloraError.fromJSON(errorJson);
 * ```
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
    this.code = options.code || "UNKNOWN_ERROR";
    this.status = options.status || 500;
    this.context = options.context || {};
    this.userMessage = options.userMessage || options.message;
    this.source = options.source || "unknown";
    this.retry = options.retry !== undefined ? options.retry : true;
    this.severity = options.severity || "medium";
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
      requestId: this.requestId,
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
      requestId: json.requestId,
    });

    error.timestamp = json.timestamp;
    return error;
  }
}

/**
 * API-related errors
 * Used for errors that occur during API calls
 *
 * @class ApiError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new ApiError({
 *   message: 'Failed to fetch user data',
 *   status: 503,
 *   context: { endpoint: '/users/123' }
 * });
 * ```
 */
export class ApiError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "API_ERROR",
      status: 500,
      context: details,
      source: "server",
      severity: "medium",
    });
  }
}

/**
 * Authentication-related errors
 * Used for login failures, token validation issues, etc.
 *
 * @class AuthError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new AuthError({
 *   message: 'Invalid credentials',
 *   userMessage: 'The email or password you entered is incorrect'
 * });
 * ```
 */
export class AuthError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "AUTH_ERROR",
      status: 401,
      context: details,
      source: "client",
      severity: "high",
    });
  }
}

/**
 * Permission-related errors
 * Used when a user attempts an action they don't have permission for
 *
 * @class PermissionError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new PermissionError({
 *   message: 'User does not have admin privileges',
 *   userMessage: 'You need administrator access to perform this action'
 * });
 * ```
 */
export class PermissionError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "PERMISSION_ERROR",
      status: 403,
      context: details,
      source: "server",
      severity: "high",
    });
  }
}

/**
 * Not found errors
 * Used when a requested resource cannot be found
 *
 * @class NotFoundError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new NotFoundError({
 *   message: 'User with ID 123 not found',
 *   userMessage: 'The requested user could not be found'
 * });
 * ```
 */
export class NotFoundError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "NOT_FOUND",
      status: 404,
      context: details,
      source: "server",
      severity: "medium",
    });
  }
}

/**
 * Input validation errors
 * Used when user input fails validation
 *
 * @class ValidationError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new ValidationError({
 *   message: 'Email format is invalid',
 *   context: { field: 'email', value: 'invalid-email' }
 * });
 * ```
 */
export class ValidationError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "VALIDATION_ERROR",
      status: 400,
      context: details,
      source: "client",
      severity: "medium",
    });
  }
}

/**
 * Database-related errors
 * Used for database connection issues, constraint violations, etc.
 *
 * @class DatabaseError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new DatabaseError({
 *   message: 'Failed to insert record due to unique constraint violation',
 *   code: 'DB_CONSTRAINT_ERROR',
 *   context: { table: 'users', constraint: 'users_email_key' }
 * });
 * ```
 */
export class DatabaseError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "DATABASE_ERROR",
      status: 500,
      context: details,
      source: "database",
      severity: "high",
    });
  }
}

/**
 * Network-related errors
 * Used for connectivity issues, timeouts, etc.
 *
 * @class NetworkError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new NetworkError({
 *   message: 'Request timed out after 30 seconds',
 *   retry: true
 * });
 * ```
 */
export class NetworkError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "NETWORK_ERROR",
      status: 500,
      context: details,
      source: "client",
      severity: "medium",
      retry: true,
    });
  }
}

/**
 * Configuration errors
 * Used for missing or invalid configuration settings
 *
 * @class ConfigError
 * @extends AlloraError
 * @example
 * ```typescript
 * throw new ConfigError({
 *   message: 'Missing required API key',
 *   code: 'MISSING_API_KEY',
 *   retry: false
 * });
 * ```
 */
export class ConfigError extends AlloraError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      message,
      code: "CONFIG_ERROR",
      status: 500,
      context: details,
      source: "server",
      severity: "high",
      retry: false,
    });
  }
}
