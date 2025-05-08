
// Environment variable manager for consistent access across the application
import { createClient } from '@supabase/supabase-js';
import { getEnv, validateEnv, corsHeaders } from './envUtils';
import type { EnvVariable } from './envUtils';

/**
 * Environment configuration with safe fallbacks
 */
export const envConfig = {
  supabaseUrl: getEnv('SUPABASE_URL', ''),
  supabaseAnonKey: getEnv('SUPABASE_ANON_KEY', ''),
  supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY', ''),
};

/**
 * Get Supabase client with optional auth override
 */
export function getSupabaseClient(authToken?: string) {
  const supabaseUrl = envConfig.supabaseUrl;
  const supabaseKey = envConfig.supabaseAnonKey;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not available');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    },
  });
}

/**
 * Validate required environment variables for edge functions
 */
export function validateEdgeFunctionEnv(requiredVars: string[]): { valid: boolean; errors: string[] } {
  const result = validateEnv(requiredVars);
  
  if (!result.valid) {
    return {
      valid: false,
      errors: result.missing.map(name => `Missing required environment variable: ${name}`),
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Safe access to environment variables with typing
 */
export function safeGetEnv(name: string): EnvVariable {
  return getEnv(name);
}
