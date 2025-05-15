
/**
 * Environment validation and utilities
 */

import { getEnv } from './envUtils';

/**
 * Get and validate a required environment variable
 * Throws an error if the variable is not defined
 */
export function getEnvironmentVariable(key: string): string {
  const value = getEnv(key);
  
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
}

/**
 * Validate that required environment variables exist
 * Throws an error listing all missing variables
 */
export function validateEnvironment(requiredVars: string[]): void {
  const missingVars = requiredVars.filter(key => !getEnv(key));
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}
