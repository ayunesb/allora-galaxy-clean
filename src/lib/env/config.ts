
import { ENV } from './envUtils';

// Define types for our environment variables
interface EnvVariable {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
}

// Environment variable constants
export const ENV_NAMES = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
  STRIPE_PUBLISHABLE_KEY: 'VITE_STRIPE_PUBLISHABLE_KEY',
  OPENAI_API_KEY: 'VITE_OPENAI_API_KEY',
  HUBSPOT_API_KEY: 'HUBSPOT_API_KEY',
  GA_MEASUREMENT_ID: 'VITE_GA_MEASUREMENT_ID',
};

/**
 * Core environment variables required by the application
 */
export const coreEnvVars: EnvVariable[] = [
  {
    name: ENV_NAMES.SUPABASE_URL,
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: ENV_NAMES.SUPABASE_ANON_KEY,
    required: true,
    description: 'Supabase anonymous key',
  }
];

/**
 * Optional integration environment variables
 */
export const integrationEnvVars: EnvVariable[] = [
  {
    name: ENV_NAMES.STRIPE_PUBLISHABLE_KEY,
    required: false,
    description: 'Stripe publishable key for billing',
  },
  {
    name: ENV_NAMES.OPENAI_API_KEY,
    required: false,
    description: 'OpenAI API key',
  },
  {
    name: ENV_NAMES.HUBSPOT_API_KEY,
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
    result[envVar.name] = ENV(envVar.name) || envVar.default || '';
  }
  
  return result;
}

/**
 * Get all environment variable values including optional ones
 */
export function getAllEnvValues(): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const envVar of [...coreEnvVars, ...integrationEnvVars]) {
    result[envVar.name] = ENV(envVar.name) || envVar.default || '';
  }
  
  return result;
}

/**
 * Validate environment variables
 */
function validateEnv(envVars: EnvVariable[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const envVar of envVars) {
    if (envVar.required) {
      const value = ENV(envVar.name);
      if (!value && !envVar.default) {
        missing.push(`${envVar.name}: ${envVar.description || 'No description'}`);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
