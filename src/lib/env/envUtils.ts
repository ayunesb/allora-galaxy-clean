/**
 * Centralized environment variable handling for Allora OS
 * Works in both browser and edge function environments
 */

// Constants for environment names
export const ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
};

// Standard CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Get an environment variable safely
 * Works in both browser and edge environments
 */
// Fix: Use import.meta.env for Vite/browser instead of process.env
export function getEnv(key: string): string | undefined {
  // Use import.meta.env for Vite/browser environments
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
  }
  // Optionally, fallback to process.env for Node.js (if ever used in SSR)
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
}

/**
 * Get an environment variable with a default value
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
  return getEnv(key) || defaultValue;
}

/**
 * Get a "safe" environment variable - throws if not found
 */
export function getSafeEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Check if an environment variable is "true"
 */
export function isEnvTrue(key: string): boolean {
  const value = getEnv(key);
  return value === "true" || value === "1";
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return getEnv("NODE_ENV") === "development";
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return getEnv("NODE_ENV") === "production";
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return getEnv("NODE_ENV") === "test";
}

/**
 * Get all environment variables with a certain prefix
 */
export function getEnvsByPrefix(prefix: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (typeof window !== "undefined") {
    // Browser - check process.env
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith(prefix)) {
        const value = process.env[key];
        if (value !== undefined) {
          result[key] = value;
        }
      }
    });
  } else if (typeof globalThis.Deno !== "undefined") {
    // Edge function - no way to get all env vars
    // This is a limitation of Deno's security model
    console.warn("getEnvsByPrefix is not fully supported in edge functions");
  }

  return result;
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  // Explicitly check edge environment first
  if (typeof globalThis.Deno !== "undefined") {
    // Edge function environment - try to use VERCEL_URL
    // @ts-expect-error - Deno exists in edge functions
    const vercelUrl = Deno.env.get("VERCEL_URL");
    if (vercelUrl) {
      return `https://${vercelUrl}`;
    }

    // Fallback for edge functions
    return "";
  }

  // Browser environment
  if (typeof window !== "undefined") {
    return "";
  }

  // Server environment (Node.js)
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Add index signature to globalThis for Deno detection
declare global {
   
  // @ts-ignore
  // Add index signature for Deno detection
   
  interface GlobalThis {
    [key: string]: unknown;
  }
}
