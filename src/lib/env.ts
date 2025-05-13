
/**
 * Environment utilities for safely accessing environment variables
 * Works with both Vite and Deno environments
 */

/**
 * Safely get an environment variable with a fallback value
 * @param name The name of the environment variable
 * @param fallback Optional fallback value if the environment variable is not found
 * @returns The environment variable value or the fallback value
 */
export function getEnvWithDefault(name: string, fallback: string = ""): string {
  try {
    // Try to access import.meta.env (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[name];
      if (value !== undefined) return value;
    }
    
    // Try to access Deno.env (Deno)
    if (typeof Deno !== 'undefined' && Deno.env) {
      try {
        const value = Deno.env.get(name);
        if (value !== undefined && value !== null) return value;
      } catch (err) {
        // Ignore Deno permission errors
      }
    }

    // Try to access process.env (Node.js)
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[name];
      if (value !== undefined) return value;
    }
    
    // Return fallback if not found in any environment
    return fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Boolean environment variable helper
 * @param name The name of the environment variable
 * @param fallback Optional fallback value if the environment variable is not found
 * @returns Boolean representation of the environment variable
 */
export function getBoolEnv(name: string, fallback: boolean = false): boolean {
  const value = getEnvWithDefault(name, fallback ? 'true' : 'false');
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Number environment variable helper
 * @param name The name of the environment variable
 * @param fallback Optional fallback value if the environment variable is not found
 * @returns Numeric representation of the environment variable
 */
export function getNumEnv(name: string, fallback: number = 0): number {
  const value = getEnvWithDefault(name, String(fallback));
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}
