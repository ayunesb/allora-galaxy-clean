
/**
 * Safely access Deno environment variables in edge functions
 * This prevents errors when running in non-Deno environments
 * @param key The environment variable name
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 */
export function safeGetDenoEnv(key: string, defaultValue: string = ''): string {
  try {
    // Try to access Deno.env if available
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      const value = (globalThis as any).Deno.env.get(key);
      if (value !== undefined) return value;
    }
    return defaultValue;
  } catch (e) {
    console.warn(`Error accessing Deno env for ${key}:`, e);
    return defaultValue;
  }
}
