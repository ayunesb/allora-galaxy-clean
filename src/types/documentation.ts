
/**
 * @file Documentation types and interfaces
 * This file contains type definitions for documentation-related functionality
 */

/**
 * Represents a code example with title, description, and code snippet
 */
export interface CodeExample {
  /** Title of the code example */
  title: string;
  /** Description explaining the example's purpose */
  description: string;
  /** The actual code snippet as a string */
  code: string;
  /** Optional language for syntax highlighting */
  language?: string;
}

/**
 * API Endpoint documentation
 */
export interface ApiEndpoint {
  /** Endpoint path (e.g., "/api/strategies") */
  path: string;
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: string;
  /** Human-readable description of the endpoint */
  description: string;
  /** Whether authentication is required */
  requiresAuth: boolean;
  /** Expected request body format */
  requestBody?: Record<string, any>;
  /** Expected response format */
  responseFormat?: Record<string, any>;
  /** Example response data */
  exampleResponse?: Record<string, any>;
  /** Potential error responses */
  errors?: Array<{
    code: number;
    message: string;
    reason?: string;
  }>;
}

/**
 * Database schema documentation for a single table
 */
export interface TableSchema {
  /** Table name */
  name: string;
  /** Description of the table's purpose */
  description: string;
  /** Table columns */
  columns: Array<{
    name: string;
    type: string;
    description: string;
    nullable: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    references?: {
      table: string;
      column: string;
    };
  }>;
  /** Row Level Security (RLS) policies */
  rlsPolicies?: Array<{
    name: string;
    operation: string;
    definition: string;
  }>;
}
