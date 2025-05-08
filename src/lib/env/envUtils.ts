
/**
 * Utility functions for handling environment variables across
 * different environments (browser, Node, Deno)
 */

/**
 * Gets an environment variable with a fallback value
 * Works in browser, Node.js, and Deno environments
 */
export function getEnvVar(name: string, fallback: string = ''): string {
  try {
    // Browser environment (window.ENV for injected variables)
    if (typeof window !== 'undefined' && window.ENV && window.ENV[name]) {
      return window.ENV[name];
    }
    
    // Vite environment variables
    if (import.meta?.env && (import.meta.env as any)[name]) {
      return (import.meta.env as any)[name];
    }
    
    // Deno environment
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      const value = (globalThis as any).Deno.env.get(name);
      if (value) return value;
    }
    
    // Node.js environment
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
    
    // Return fallback if no value found
    return fallback;
  } catch (error) {
    console.warn(`Error accessing environment variable ${name}:`, error);
    return fallback;
  }
}

/**
 * Safely check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safely check if we're in a server environment (Node.js or Deno)
 */
export function isServer(): boolean {
  return !isBrowser();
}
