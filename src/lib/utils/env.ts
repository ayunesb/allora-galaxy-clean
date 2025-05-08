
import { getEnv as getEnvUtil } from '@/lib/env/envUtils';

/**
 * Universal environment variable getter 
 * @deprecated Use getEnv from '@/lib/env/envUtils' instead
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  return getEnvUtil(key) || defaultValue;
}
