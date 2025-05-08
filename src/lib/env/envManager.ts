
/**
 * Re-export environment utility functions from the unified environment system
 */
import { getEnvVar, validateEnv, ENV, corsHeaders } from '@/lib/env/envUtils';
export type { EnvVariable } from '@/lib/env/envUtils';

export { getEnvVar, validateEnv, corsHeaders, ENV };
