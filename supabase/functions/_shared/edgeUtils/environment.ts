
/**
 * Environment utilities for Supabase Edge Functions
 */

/**
 * Safely get a Deno environment variable with fallback
 * @param key - Environment variable name
 * @param defaultValue - Default value if not found
 * @returns The environment variable value or default
 */
export function safeGetEnv(key: string, defaultValue: string = ''): string {
  try {
    return Deno.env.get(key) ?? defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Get required environment variables or throw error
 * @param keys - Array of required environment variable names
 * @returns Object with key-value pairs of environment variables
 * @throws Error if any required variables are missing
 */
export function getRequiredEnvs(keys: string[]): Record<string, string> {
  const missingKeys: string[] = [];
  const values: Record<string, string> = {};
  
  for (const key of keys) {
    const value = safeGetEnv(key);
    if (!value) {
      missingKeys.push(key);
    } else {
      values[key] = value;
    }
  }
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
  
  return values;
}

/**
 * Check if environment is development
 * @returns boolean indicating if in development environment
 */
export function isDevelopment(): boolean {
  return safeGetEnv('ENVIRONMENT', 'development').toLowerCase() === 'development';
}

/**
 * Check if environment is production
 * @returns boolean indicating if in production environment
 */
export function isProduction(): boolean {
  return safeGetEnv('ENVIRONMENT', 'development').toLowerCase() === 'production';
}

/**
 * Check if environment is test
 * @returns boolean indicating if in test environment
 */
export function isTest(): boolean {
  return safeGetEnv('ENVIRONMENT', 'development').toLowerCase() === 'test';
}
