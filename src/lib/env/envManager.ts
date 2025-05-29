import { ENV } from "./envUtils";

/**
 * Get an environment variable with optional default value
 * @deprecated Use ENV or getEnvWithDefault from '@/lib/env' instead
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  // Try from process.env for Node.js environments
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  // Try from import.meta.env for Vite environments
  try {
    // @ts-expect-error - import.meta.env is available in Vite
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-expect-error
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors when import.meta is not available (e.g. in edge functions)
  }

  // Try from env utility (which may connect to Deno.env)
  if (typeof ENV === "object" && key in ENV) {
    // @ts-expect-error - We've checked that key exists in ENV
    return ENV[key];
  }

  // Log missing env in development
  const isDev = process.env.NODE_ENV === "development";
  if (isDev && defaultValue === undefined) {
    console.warn(`Environment variable ${key} not found`);
  }

  // Return default value if provided
  return defaultValue;
}

/**
 * Get a required environment variable, throwing if not found
 * @deprecated Use ENV from '@/lib/env' and handle errors at the call site
 */
export function ensureEnv(key: string, errorMessage?: string): string {
  const value = getEnv(key);

  if (!value) {
    throw new Error(
      errorMessage || `Required environment variable ${key} is missing`,
    );
  }

  return value;
}
