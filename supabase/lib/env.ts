
import { getEnvVar, corsHeaders } from "../lib/envUtils";

/**
 * Universal environment variable getter that works in both Deno and Node environments
 * @param key The environment variable key to retrieve
 * @param defaultValue Optional default value if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  return getEnvVar(key, defaultValue);
}

// Export CORS headers for edge functions
export { corsHeaders };
