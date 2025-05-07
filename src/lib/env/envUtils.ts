
/**
 * Unified environment variable management for Allora OS
 * Works consistently across Node, browser, and Deno environments with proper fallbacks
 */

/**
 * Safely retrieve an environment variable across all runtime environments
 * @param key Environment variable name
 * @param defaultValue Fallback value if not found
 * @returns The environment variable value or default
 */
export function getEnvVar(key: string, defaultValue: string = ""): string {
  try {
    // Try Deno environment first (edge functions)
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      return (globalThis as any).Deno.env.get(key) || defaultValue;
    }
    
    // Try Node environment next
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    // Try browser environment (Vite imports)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = (import.meta.env as Record<string, string>)[key];
      return value || defaultValue;
    }
    
    // Return default if all else fails
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Environment variable configuration interface
 */
export interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  default?: string;
}

/**
 * Validate required environment variables
 * @param variables List of environment variables to validate
 * @returns Object containing all environment variables with values
 */
export function validateEnv(variables: EnvVariable[]): Record<string, string> {
  const values: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const variable of variables) {
    const value = getEnvVar(variable.name, variable.default || "");
    values[variable.name] = value;
    
    if (variable.required && !value) {
      missing.push(`${variable.name} (${variable.description})`);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return values;
}

/**
 * Standard CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
