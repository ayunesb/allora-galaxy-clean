
import { safeGetDenoEnv } from '../../env/safeEdgeEnv';

/**
 * Safely get environment variables in Deno edge functions
 * @param key The environment variable name
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 */
export function safeGetDenoEnv(key: string, defaultValue: string = ''): string {
  return safeGetDenoEnv(key, defaultValue);
}

/**
 * Get secure environment variables required for strategy execution
 * @returns Object containing secure environment variables
 */
export function getStrategyExecutionEnv(): Record<string, string> {
  return {
    OPENAI_API_KEY: safeGetDenoEnv('OPENAI_API_KEY', ''),
    SUPABASE_URL: safeGetDenoEnv('SUPABASE_URL', ''),
    SUPABASE_SERVICE_ROLE_KEY: safeGetDenoEnv('SUPABASE_SERVICE_ROLE_KEY', ''),
    HUBSPOT_API_KEY: safeGetDenoEnv('HUBSPOT_API_KEY', '')
  };
}

/**
 * Validate required environment variables for strategy execution
 * @returns Object with validation result and missing variables
 */
export function validateStrategyExecutionEnv(): { valid: boolean; missing: string[] } {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredVars.filter(key => !safeGetDenoEnv(key));
  
  return {
    valid: missingVars.length === 0,
    missing: missingVars
  };
}
