import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to format a currency value
 * @param value The value to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Truncate a string to a specified length
 * @param str String to truncate
 * @param length Maximum length
 * @param suffix Suffix to add to truncated string
 * @returns Truncated string
 */
export function truncate(str: string, length: number, suffix = "..."): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + suffix;
}

/**
 * Simple retry utility
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 300, onRetry } = options;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);

      if (onRetry && error instanceof Error) {
        onRetry(error, attempt);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Create a debounced version of a function
 * @param fn Function to debounce
 * @param delay Delay in ms
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Create a throttled version of a function
 * @param fn Function to throttle
 * @param limit Time limit in ms
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Generate a unique ID
 * @returns Unique ID string
 */
export function uniqueId(prefix = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Deep copy an object
 * @param obj Object to copy
 * @returns Deep copied object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove undefined values from an object (useful for API requests)
 * @param obj Object to clean
 * @returns Cleaned object
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as Partial<T>;
}

// Re-export cookie utilities
export {
  getCookieConsentStatus,
  setCookieConsentStatus,
  getCookiePreferences,
  type CookiePreferences,
} from "./utils/cookieUtils";
