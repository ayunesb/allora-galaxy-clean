
// Types for environment variables
export interface EnvVariable {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
}

// Environment variable constants
export const ENV = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_KEY: 'SUPABASE_SERVICE_ROLE_KEY',
  STRIPE_PUBLISHABLE_KEY: 'VITE_STRIPE_PUBLISHABLE_KEY',
  OPENAI_API_KEY: 'VITE_OPENAI_API_KEY',
  HUBSPOT_API_KEY: 'HUBSPOT_API_KEY',
  GA_MEASUREMENT_ID: 'VITE_GA_MEASUREMENT_ID',
};

/**
 * Safely gets environment variables across different runtimes (Node.js, Deno, browser)
 */
export function getEnvVar(key: string, defaultValue: string = ""): string {
  try {
    // Check for Deno environment
    if (typeof globalThis !== "undefined" && "Deno" in globalThis) {
      // Use type assertion to handle the Deno global
      const deno = (globalThis as any).Deno;
      if (deno && deno.env && typeof deno.env.get === "function") {
        return deno.env.get(key) || defaultValue;
      }
    }
    
    // Check for Node.js environment
    if (typeof process !== "undefined" && process.env) {
      return process.env[key] || defaultValue;
    }
    
    // Check for browser environment with custom env object
    if (typeof window !== "undefined" && typeof (window as any).ENV === 'object') {
      const envObj = (window as any).ENV as Record<string, string>;
      if (key in envObj) {
        return envObj[key] || defaultValue;
      }
    }
    
    // Special case for Vite env vars in browser
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return (import.meta.env[key] as string) || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Validate required environment variables
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

// CORS headers for Edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
