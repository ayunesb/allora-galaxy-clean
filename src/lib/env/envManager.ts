
import { DEV } from 'vite/env';
import { env } from './envUtils';

export function getEnv(key: string, defaultValue?: string): string | undefined {
  // Try from process.env for Node.js environments
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Try from import.meta.env for Vite environments
  // @ts-ignore - import.meta.env is available in Vite
  if (import.meta && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  
  // Try from env utility (which may connect to Deno.env)
  const value = env(key);
  if (value !== undefined) {
    return value;
  }
  
  // Log missing env in development
  if (DEV && defaultValue === undefined) {
    console.warn(`Environment variable ${key} not found`);
  }
  
  // Return default value if provided
  return defaultValue;
}

export function ensureEnv(key: string, errorMessage?: string): string {
  const value = getEnv(key);
  
  if (!value) {
    throw new Error(errorMessage || `Required environment variable ${key} is missing`);
  }
  
  return value;
}
