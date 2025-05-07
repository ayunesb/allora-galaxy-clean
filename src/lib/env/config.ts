
import { EnvVariable, validateEnv } from './envManager';

/**
 * Core environment variables required by the application
 */
export const coreEnvVars: EnvVariable[] = [
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  }
];

/**
 * Optional integration environment variables
 */
export const integrationEnvVars: EnvVariable[] = [
  {
    name: 'VITE_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key for billing',
  },
  {
    name: 'VITE_GA_MEASUREMENT_ID',
    required: false,
    description: 'Google Analytics measurement ID',
  },
  {
    name: 'VITE_HUBSPOT_PORTAL_ID',
    required: false,
    description: 'HubSpot portal ID',
  }
];

/**
 * Validate the core environment variables and return their values
 */
export function getCoreEnv(): Record<string, string> {
  return validateEnv(coreEnvVars);
}

/**
 * Get all environment variables including optional ones
 */
export function getAllEnv(): Record<string, string> {
  return validateEnv([...coreEnvVars, ...integrationEnvVars]);
}
