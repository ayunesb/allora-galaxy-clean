
/**
 * Environment configuration for the application
 */

// Get environment variables
import { getEnv } from './envUtils';

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Core environment variables
export const ENVIRONMENT = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  SUPABASE_URL: getEnv('SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_ROLE_KEY: getEnv('SUPABASE_SERVICE_ROLE_KEY', ''),
};

// Environment type
export type Environment = 'development' | 'test' | 'production';

/**
 * Get an environment variable
 * @param name Variable name
 * @param required Whether the variable is required
 * @returns Variable value or empty string
 */
export function getEnvironmentVariable(name: string, required: boolean = false): string {
  const value = getEnv(name);

  if (required && !value) {
    console.error(`Required environment variable ${name} is not defined!`);
  }

  return value;
}

/**
 * Validate that required environment variables are defined
 * @param requiredVariables Array of required variable names
 * @returns True if all required variables are defined
 */
export function validateEnvironment(requiredVariables: string[]): boolean {
  let isValid = true;

  for (const variable of requiredVariables) {
    if (!getEnvironmentVariable(variable, true)) {
      isValid = false;
    }
  }

  return isValid;
}
