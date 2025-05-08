
import { corsHeaders } from '@/lib/env';

/**
 * Universal environment variable getter that works in both Deno and Node environments
 * @param key The environment variable key to retrieve
 * @param defaultValue Optional default value if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  try {
    // Use type assertion here for Deno environment
    const deno = (globalThis as any).Deno;
    if (deno && typeof deno.env?.get === "function") {
      return deno.env.get(key) ?? defaultValue;
    }
    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

// Re-export CORS headers for use in edge functions
export { corsHeaders };
