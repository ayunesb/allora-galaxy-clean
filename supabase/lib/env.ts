
/**
 * Gets an environment variable in a cross-platform way (works in both Deno and Node)
 * @param name The name of the environment variable
 * @returns The value of the environment variable, or an empty string if not found
 */
export function getEnv(name: string): string {
  // Try to get from Deno first (Edge Functions environment)
  try {
    if (typeof Deno !== 'undefined') {
      return Deno.env.get(name) || '';
    }
  } catch (_) {
    // Deno not available or permission error
  }
  
  // Fall back to Node process.env (local development)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name] || '';
    }
  } catch (_) {
    // process not available
  }
  
  // No environment variable systems available
  return '';
}
