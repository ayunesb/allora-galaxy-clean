
import { getEnvWithDefault } from '@/lib/env/envUtils';
import { corsHeaders } from '@/lib/env';

/**
 * Universal environment variable getter that works in both Deno and Node environments
 * @param key The environment variable key to retrieve
 * @param defaultValue Optional default value if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  try {
    // First try Deno environment
    if (typeof Deno !== 'undefined' && Deno?.env?.get) {
      const value = Deno.env.get(key);
      if (value !== undefined) return value;
    }
    
    // Fall back to process.env for Node environments
    if (typeof process !== 'undefined' && process?.env) {
      const value = process.env[key];
      if (value !== undefined) return value;
    }
    
    // Use import.meta.env for browser/Vite environments
    try {
      // @ts-ignore - import.meta is available in Vite
      if (import.meta?.env && import.meta.env[key] !== undefined) {
        // @ts-ignore
        return import.meta.env[key];
      }
    } catch (e) {
      // Ignore errors accessing import.meta (not available in all contexts)
    }
    
    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

// Re-export CORS headers for use in edge functions
export { corsHeaders };

// Export getEnvWithDefault for convenience
export { getEnvWithDefault };
