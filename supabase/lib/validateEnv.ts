
import { getEnv } from "./env";

/**
 * Type definition for environment variable requirements
 */
export interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

/**
 * Validate a list of environment variables and return their values
 */
export function validateEnv(requiredEnvs: EnvVar[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const env of requiredEnvs) {
    const value = getEnv(env.name);
    result[env.name] = value;
    
    if (env.required && !value) {
      missing.push(`${env.name} (${env.description})`);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return result;
}
