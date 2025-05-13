
/**
 * Environment utilities for Supabase Edge Functions
 */

/**
 * Safely get environment variable with fallback
 * @param name Environment variable name
 * @param fallback Default value if environment variable doesn't exist
 * @returns Environment variable value or fallback
 */
export function safeGetEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Interface for required environment variables
 */
export interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  fallback?: string;
}

/**
 * Get required environment variables with validation
 * @param requiredEnvs List of required environment variables
 * @returns Object with environment variables
 * @throws Error if required environment variable is missing
 */
export function getRequiredEnvs(requiredEnvs: EnvVar[]): Record<string, string> {
  const envVars: Record<string, string> = {};
  const missingVars: string[] = [];

  for (const env of requiredEnvs) {
    const value = safeGetEnv(env.name, env.fallback || "");
    envVars[env.name] = value;
    
    if (env.required && !value) {
      missingVars.push(`${env.name}: ${env.description}`);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }

  return envVars;
}

/**
 * Check if the environment is development
 * @returns true if development environment
 */
export function isDevelopment(): boolean {
  const environment = safeGetEnv("ENVIRONMENT", "");
  return environment.toLowerCase() === "development";
}

/**
 * Check if the environment is production
 * @returns true if production environment
 */
export function isProduction(): boolean {
  const environment = safeGetEnv("ENVIRONMENT", "");
  return environment.toLowerCase() === "production";
}

/**
 * Check if the environment is test
 * @returns true if test environment
 */
export function isTest(): boolean {
  const environment = safeGetEnv("ENVIRONMENT", "");
  return environment.toLowerCase() === "test";
}
