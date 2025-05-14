
/**
 * Environment variable configuration
 */
export interface EnvVar {
  name: string;
  required: boolean;
  description?: string;
}

/**
 * Validate required environment variables
 * @param requiredVars Array of environment variable definitions
 * @returns Object with environment variables
 */
export function validateEnv(requiredVars: EnvVar[]): Record<string, string> {
  const env: Record<string, string> = {};
  const missing: string[] = [];

  requiredVars.forEach(({ name, required, description }) => {
    const value = getEnv(name, '');
    
    if (required && !value) {
      missing.push(`${name}${description ? ` (${description})` : ''}`);
    }
    
    env[name] = value;
  });

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return env;
}

/**
 * Safely get environment variables with fallback
 * @param name The name of the environment variable
 * @param fallback Optional fallback value if not found
 * @returns The environment variable value or fallback
 */
export function getEnv(name: string, fallback: string = ""): string {
  try {
    const value = Deno.env.get(name);
    return value !== undefined ? value : fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}
