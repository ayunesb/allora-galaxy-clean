
/**
 * Universal environment variable getter that works in both Deno and Node environments
 * @param key The environment variable key to retrieve
 * @param defaultValue Optional default value if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  try {
    // Check if we're in Deno environment
    if (typeof globalThis !== 'undefined' && 'Deno' in globalThis && typeof (globalThis as any).Deno?.env?.get === 'function') {
      return (globalThis as any).Deno.env.get(key) || defaultValue;
    }
    // We're in Node environment
    return process.env[key] || defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
}
