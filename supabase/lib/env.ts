
/**
 * Environment utilities for edge functions
 */

export type EnvVar = string | undefined;

/**
 * Get an environment variable with validation
 * @param name The name of the environment variable
 * @param required Whether the variable is required
 * @param fallback Fallback value if not found and not required
 * @returns The environment variable value
 * @throws Error if the variable is required but not found
 */
export function getEnv(
  name: string, 
  required: boolean = false,
  fallback: string = ''
): string {
  let value: EnvVar;
  
  try {
    value = Deno.env.get(name);
  } catch (err) {
    if (required) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    console.warn(`Environment variable ${name} is not available: ${err}`);
    return fallback;
  }
  
  if (value === undefined) {
    if (required) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return fallback;
  }
  
  return value;
}

/**
 * Validate multiple required environment variables
 * @param names Array of environment variable names to validate
 * @returns Object with validation result and any missing variables
 */
export function validateEnv(names: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  for (const name of names) {
    try {
      const value = Deno.env.get(name);
      if (value === undefined) {
        missing.push(name);
      }
    } catch (err) {
      missing.push(name);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
