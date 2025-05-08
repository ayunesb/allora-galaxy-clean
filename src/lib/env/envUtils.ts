
/**
 * Utility functions for handling environment variables across
 * different environments (browser, Node, Deno)
 */

export type EnvVariable = {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
};

// Environment variable constants
export const ENV = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
  STRIPE_PUBLISHABLE_KEY: 'VITE_STRIPE_PUBLISHABLE_KEY',
  OPENAI_API_KEY: 'VITE_OPENAI_API_KEY',
  HUBSPOT_API_KEY: 'HUBSPOT_API_KEY',
  GA_MEASUREMENT_ID: 'VITE_GA_MEASUREMENT_ID',
};

/**
 * Gets an environment variable with a fallback value
 * Works in browser, Node.js, and Deno environments
 */
export function getEnvVar(name: string, fallback: string = ''): string {
  try {
    // Browser environment (window.ENV for injected variables)
    if (typeof window !== 'undefined' && window.ENV && window.ENV[name]) {
      return window.ENV[name];
    }
    
    // Vite environment variables
    if (import.meta?.env && (import.meta.env as any)[name]) {
      return (import.meta.env as any)[name];
    }
    
    // Deno environment
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      const value = (globalThis as any).Deno.env.get(name);
      if (value) return value;
    }
    
    // Node.js environment
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
    
    // Return fallback if no value found
    return fallback;
  } catch (error) {
    console.warn(`Error accessing environment variable ${name}:`, error);
    return fallback;
  }
}

/**
 * Safely check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely check if we're in a server environment (Node.js or Deno)
 */
export function isServer(): boolean {
  return !isBrowser();
}

/**
 * Validate environment variables
 */
export function validateEnv(envVars: EnvVariable[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const envVar of envVars) {
    if (envVar.required) {
      const value = getEnvVar(envVar.name, envVar.default);
      if (!value) {
        missing.push(`${envVar.name}: ${envVar.description || 'No description'}`);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
