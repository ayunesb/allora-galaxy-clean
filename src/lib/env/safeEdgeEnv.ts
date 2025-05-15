
/**
 * Safe environment variable access for edge functions
 */

/**
 * Safe way to get Deno environment variables without TypeScript errors
 */
export function safeGetDenoEnv(key: string): string | undefined {
  try {
    // @ts-ignore - Deno exists in edge functions
    return Deno.env.get(key);
  } catch (error) {
    console.error(`Error accessing Deno.env.get for key ${key}:`, error);
    return undefined;
  }
}

/**
 * Get environment variable in edge function environment
 */
export function getEdgeEnv(key: string, defaultValue: string = ''): string {
  const value = safeGetDenoEnv(key);
  return value !== undefined ? value : defaultValue;
}

/**
 * Get the current environment name in edge functions
 */
export function getEdgeEnvironment(): 'development' | 'production' | 'test' {
  const env = safeGetDenoEnv('NODE_ENV');
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
}
