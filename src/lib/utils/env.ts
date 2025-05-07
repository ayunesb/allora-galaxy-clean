
import { getEnvVar } from '@/lib/env/envUtils';

/**
 * Universal environment variable getter 
 * @deprecated Use getEnvVar from '@/lib/env/envUtils' instead
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  return getEnvVar(key, defaultValue);
}
