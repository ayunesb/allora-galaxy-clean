
import { StrategyExecutionResult } from './types';

/**
 * Helper function to safely get environment variables with fallbacks
 */
export function safeGetEnv(name: string, fallback: string = ""): string {
  try {
    // Use a more TypeScript-friendly approach to check for Deno environment
    if (typeof globalThis !== "undefined" && 
        typeof (globalThis as any).Deno !== "undefined" && 
        typeof (globalThis as any).Deno.env?.get === "function") {
      return (globalThis as any).Deno.env.get(name) ?? fallback;
    }
    
    // Node.js environment
    if (typeof process !== "undefined" && process.env) {
      return process.env[name] || fallback;
    }
    
    return fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Validate input parameters for strategy execution
 */
export function validateStrategyInput(input: any): { valid: boolean; error?: string } {
  if (!input) {
    return { valid: false, error: "No input provided" };
  }
  
  if (!input.strategy_id) {
    return { valid: false, error: "Strategy ID is required" };
  }
  
  if (!input.tenant_id) {
    return { valid: false, error: "Tenant ID is required" };
  }
  
  return { valid: true };
}

/**
 * Track execution metrics for a strategy run
 */
export async function trackStrategyMetrics(
  tenant_id: string,
  strategy_id: string,
  execution_id: string,
  result: StrategyExecutionResult
): Promise<void> {
  try {
    console.log(`[${execution_id}] Strategy execution metrics:`, {
      tenant_id,
      strategy_id,
      success: result.success,
      execution_time: result.execution_time,
      status: result.status
    });
  } catch (error) {
    console.error("Failed to track strategy metrics:", error);
  }
}
