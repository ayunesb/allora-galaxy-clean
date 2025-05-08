
/**
 * Environment variable utilities
 * Safe access to environment variables with fallbacks
 */

// Node.js environments (server, build time, etc.)
const isNode = typeof process !== 'undefined' && 
  process.versions != null && 
  process.versions.node != null;

// Browser environments
const isBrowser = typeof window !== 'undefined';

/**
 * Get an environment variable value safely
 * 
 * @param key - Environment variable name
 * @param defaultValue - Optional fallback value
 * @returns The environment variable value or default
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  // For Deno/Edge environments
  if (typeof Deno !== 'undefined') {
    try {
      // Try to get from Deno.env
      const value = Deno.env.get(key);
      if (value !== undefined) return value;
    } catch (err) {
      // Likely running in a restricted environment
      console.warn(`Unable to access Deno.env for ${key}:`, err);
    }
  }

  // For Node.js environments
  if (isNode && process.env) {
    const value = process.env[key];
    if (value !== undefined) return value;
  }

  // For browser environments (Vite replaces these at build time)
  if (isBrowser) {
    // Import.meta.env is replaced by Vite at build time
    const importMetaEnv = (import.meta as any).env;
    
    if (importMetaEnv && importMetaEnv[key] !== undefined) {
      return importMetaEnv[key];
    }
  }

  // Fall back to default value or empty string
  return defaultValue || '';
}

/**
 * Assert that an environment variable exists,
 * throw an error if it doesn't
 */
export function requireEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  return value;
}

/**
 * Check if an environment variable is true
 */
export function isEnvVarTrue(key: string): boolean {
  const val = getEnvVar(key, 'false').toLowerCase();
  return val === 'true' || val === '1' || val === 'yes';
}
