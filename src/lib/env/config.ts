
import { EnvVariable, validateEnv, ENV, getEnvVar } from './envUtils';

/**
 * Core environment variables required by the application
 */
export const coreEnvVars: EnvVariable[] = [
  {
    name: ENV.SUPABASE_URL,
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: ENV.SUPABASE_ANON_KEY,
    required: true,
    description: 'Supabase anonymous key',
  }
];

/**
 * Optional integration environment variables
 */
export const integrationEnvVars: EnvVariable[] = [
  {
    name: ENV.STRIPE_PUBLISHABLE_KEY,
    required: false,
    description: 'Stripe publishable key for billing',
  },
  {
    name: ENV.OPENAI_API_KEY,
    required: false,
    description: 'OpenAI API key',
  },
  {
    name: ENV.HUBSPOT_API_KEY,
    required: false,
    description: 'HubSpot API key',
  }
];

/**
 * Validate the core environment variables
 */
export function validateCoreEnv(): { valid: boolean; missing: string[] } {
  return validateEnv(coreEnvVars);
}

/**
 * Validate all environment variables including optional ones
 */
export function validateAllEnv(): { valid: boolean; missing: string[] } {
  return validateEnv([...coreEnvVars, ...integrationEnvVars]);
}

/**
 * Get core environment variable values
 */
export function getCoreEnvValues(): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const envVar of coreEnvVars) {
    result[envVar.name] = getEnvVar(envVar.name, envVar.default || '');
  }
  
  return result;
}

/**
 * Get all environment variable values including optional ones
 */
export function getAllEnvValues(): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const envVar of [...coreEnvVars, ...integrationEnvVars]) {
    result[envVar.name] = getEnvVar(envVar.name, envVar.default || '');
  }
  
  return result;
}

// Re-export getEnvVar for convenience
export { getEnvVar } from './envUtils';
