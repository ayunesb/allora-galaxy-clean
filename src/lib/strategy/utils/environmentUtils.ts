
/**
 * Safe environment utilities for edge functions
 */

/**
 * Safely get environment variables in Deno environment
 * @param key The environment variable key
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 */
export function getDenoEnv(key: string, defaultValue: string = ""): string {
  try {
    // Use type assertion for Deno environment
    const deno = (globalThis as any).Deno;
    
    if (deno && typeof deno.env?.get === "function") {
      const value = deno.env.get(key);
      return value ?? defaultValue;
    }
    
    return getNodeEnv(key, defaultValue);
  } catch (err) {
    console.warn(`Error accessing Deno env variable ${key}:`, err);
    return getNodeEnv(key, defaultValue);
  }
}

/**
 * Try to get environment variable from Node.js process.env
 */
function getNodeEnv(key: string, defaultValue: string = ""): string {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] ?? defaultValue;
    }
  } catch (err) {
    console.warn(`Error accessing Node env variable ${key}:`, err);
  }
  
  return defaultValue;
}

/**
 * Get environment variable that works in both browser and edge functions
 */
export function getUniversalEnv(key: string, defaultValue: string = ""): string {
  // Try Deno first
  const denoValue = getDenoEnv(key, "");
  if (denoValue) return denoValue;
  
  // Try Vite import.meta.env
  try {
    // @ts-ignore - import.meta.env is available in Vite
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore import.meta errors
  }
  
  return defaultValue;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return getUniversalEnv('NODE_ENV') === 'production';
}

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

/**
 * Get Supabase anon key - safely handling both edge and browser environments
 */
export function getSupabaseAnonKey(): string {
  return getUniversalEnv('VITE_SUPABASE_ANON_KEY', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo');
}

/**
 * Get Supabase URL - safely handling both edge and browser environments
 */
export function getSupabaseUrl(): string {
  return getUniversalEnv('VITE_SUPABASE_URL', 'https://ijrnwpgsqsxzqdemtknz.supabase.co');
}
