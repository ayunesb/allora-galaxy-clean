
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

// Common environment variable names used in the application
export interface EnvVariable {
  key: string;
  isRequired: boolean;
  defaultValue?: string;
}

// Centralized environment configuration
export const ENV = {
  SUPABASE_URL: { key: 'VITE_SUPABASE_URL', isRequired: true },
  SUPABASE_ANON_KEY: { key: 'VITE_SUPABASE_ANON_KEY', isRequired: true },
  API_URL: { key: 'VITE_API_URL', isRequired: false, defaultValue: '' },
  DEBUG_MODE: { key: 'VITE_DEBUG_MODE', isRequired: false, defaultValue: 'false' },
};

// Validate that all required environment variables are present
export function validateEnv(): Record<string, string | undefined> {
  const missing: string[] = [];
  const values: Record<string, string | undefined> = {};
  
  Object.entries(ENV).forEach(([name, config]) => {
    const value = getEnvVar(config.key, config.defaultValue);
    values[name] = value;
    
    if (config.isRequired && !value) {
      missing.push(config.key);
    }
  });
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return values;
}

/**
 * Get an environment variable value safely
 * 
 * @param key - Environment variable name
 * @param defaultValue - Optional fallback value
 * @returns The environment variable value or default
 */
export function getEnvVar(key: string, defaultValue: string = ""): string {
  // For Deno/Edge environments
  if (typeof globalThis !== 'undefined' && 'Deno' in globalThis) {
    try {
      // Try to get from Deno.env
      const deno = (globalThis as any).Deno;
      const value = deno?.env?.get?.(key);
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

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
