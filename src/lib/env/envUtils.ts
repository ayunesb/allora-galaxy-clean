
/**
 * Get an environment variable
 * @param key The name of the environment variable
 * @returns The value of the environment variable or undefined
 */
export function ENV(key: string): string | undefined {
  // Try Deno.env in edge function context
  try {
    // @ts-ignore - Deno may be available in edge functions
    if (typeof Deno !== 'undefined' && Deno.env && Deno.env.get) {
      // @ts-ignore
      return Deno.env.get(key);
    }
  } catch (e) {
    // Ignore errors when Deno is not available
  }
  
  // Try Node.js process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Try Vite import.meta.env
  try {
    // @ts-ignore - import.meta.env is available in Vite
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors when import.meta is not available
  }
  
  return undefined;
}
