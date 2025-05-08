
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with commas for thousands
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format currency amount with $ symbol and 2 decimal places
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage with % symbol
 */
export function formatPercentage(value: number, minimumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(value / 100);
}

/**
 * Format trend percentage with + or - sign
 */
export function formatTrendPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0%';
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely access an object property by path
 */
export function get(obj: any, path: string, defaultValue: any = undefined): any {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Safely access Deno environment in edge functions
 */
export function safeGetDenoEnv(name: string): string | undefined {
  try {
    if (typeof globalThis !== 'undefined') {
      const deno = globalThis as any;
      if (deno.Deno && typeof deno.Deno.env?.get === 'function') {
        return deno.Deno.env.get(name);
      }
    }
  } catch (e) {
    console.error(`Error accessing Deno env: ${e}`);
  }
  return undefined;
}
