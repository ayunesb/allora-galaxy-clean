
/**
 * Utilities for managing environment in edge functions
 */

/**
 * Format a success response
 * @param data The data to return
 * @returns Formatted success response
 */
export function formatSuccessResponse(data: any) {
  return {
    success: true,
    data
  };
}

/**
 * Format an error response
 * @param error The error to return
 * @returns Formatted error response
 */
export function formatErrorResponse(error: string | Error) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return {
    success: false,
    error: errorMessage
  };
}

/**
 * Get an environment variable
 * @param key The environment variable name
 * @param defaultValue The default value if not found
 * @returns The environment variable value
 */
export function getEnvVar(key: string, defaultValue: string = "") {
  try {
    // For Deno/Edge environments
    if (typeof globalThis !== 'undefined' && 'Deno' in globalThis) {
      try {
        const deno = (globalThis as any).Deno;
        const value = deno?.env?.get?.(key);
        if (value !== undefined) return value;
      } catch (err) {
        // Likely running in a restricted environment
        console.warn(`Unable to access Deno.env for ${key}:`, err);
      }
    }

    // For Node.js environments
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (value !== undefined) return value;
    }

    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}
