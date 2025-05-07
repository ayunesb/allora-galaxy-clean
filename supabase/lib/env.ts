
/**
 * Helper functions for working with environment variables in edge functions
 */

/**
 * Safely get an environment variable with a fallback value
 * Works in both Deno and Node environments
 * 
 * @param name - The environment variable name
 * @param fallback - The fallback value if not found
 * @returns The environment variable value or fallback
 */
export function getEnv(name: string, fallback: string = ""): string {
  try {
    // Check if we're in Deno environment
    if (typeof Deno !== "undefined" && Deno?.env) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for Node environment
    return process.env[name] || fallback;
  } catch (err) {
    // If all else fails, return the fallback
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Type definition for environment variable requirements
 */
export type EnvVar = {
  name: string;
  required: boolean;
  description: string;
};

/**
 * Validate a list of environment variables and return their values
 * 
 * @param requiredEnvs - List of required environment variables
 * @returns Object containing environment variable values
 */
export function validateEnv(requiredEnvs: EnvVar[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const env of requiredEnvs) {
    const value = getEnv(env.name);
    result[env.name] = value;
    
    if (env.required && !value) {
      missing.push(env.name);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return result;
}

/**
 * Log the status of environment variables (configured or not)
 * 
 * @param env - Object containing environment variable values
 */
export function logEnvStatus(env: Record<string, string>): void {
  const status = Object.entries(env).map(([key, value]) => ({
    key,
    configured: !!value
  }));
  
  console.log("Environment status:", status);
}
