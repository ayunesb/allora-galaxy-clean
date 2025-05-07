
/**
 * Interface for environment variable validation
 */
export interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  default?: string;
}

import { getEnv } from "./env.ts";

/**
 * Validate environment variables
 * @param envVars Array of environment variables to validate
 * @returns Object containing validated environment variables
 */
export function validateEnv(envVars: EnvVar[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const envVar of envVars) {
    const value = getEnv(envVar.name, envVar.default || '');
    result[envVar.name] = value;

    if (envVar.required && !value) {
      missing.push(`${envVar.name} (${envVar.description})`);
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
  }

  return result;
}

/**
 * Log environment status without exposing values
 * @param env Object containing environment variables
 */
export function logEnvStatus(env: Record<string, string>): void {
  console.log('Environment status:');
  
  for (const [key, value] of Object.entries(env)) {
    const status = value ? '✅' : '❌';
    console.log(`- ${key}: ${status}`);
  }
}
