
import { validateInput, validateStrategyParameters } from './validation/validateStrategy';
import { trackExecutionMetrics, notifyStakeholders } from './monitoring/trackMetrics';
import { createSupabaseAdmin } from './admin/supabaseAdmin';
import { getEnv, safeGetDenoEnv } from './utils/environmentUtils';

/**
 * Interface for validation results
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Interface for strategy execution input
 */
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

/**
 * Interface for strategy execution result
 */
export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id?: string;
  message?: string;
  error?: string;
  data?: any;
  execution_id?: string;
  execution_time?: number;
}

/**
 * Executes a strategy with comprehensive error handling
 * @param input The strategy execution input parameters
 * @returns The execution result
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  
  try {
    // Input validation with detailed error messages
    if (!input) {
      return {
        success: false,
        error: "Input parameters are required",
        execution_time: performance.now() - startTime
      };
    }

    if (!input.strategy_id) {
      return { 
        success: false, 
        error: "Strategy ID is required",
        execution_time: performance.now() - startTime
      };
    }

    if (!input.tenant_id) {
      return { 
        success: false, 
        error: "Tenant ID is required",
        execution_time: performance.now() - startTime
      };
    }
    
    // In a real implementation, record execution and run strategy
    // Here we're simulating successful execution
    console.log(`Executing strategy ${input.strategy_id} for tenant ${input.tenant_id}`);

    const executionTime = performance.now() - startTime;
    
    // Return success with execution metrics
    return {
      success: true,
      strategy_id: input.strategy_id,
      message: 'Strategy executed successfully',
      execution_time: executionTime,
      execution_id: `exec_${Date.now()}`
    };
  } catch (error: any) {
    const executionTime = performance.now() - startTime;
    console.error("Error executing strategy:", error);
    
    // Return detailed error with execution metrics
    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy',
      execution_time: executionTime
    };
  }
}

// Re-export functions from the utility modules for backward compatibility
export {
  validateInput,
  validateStrategyParameters,
  trackExecutionMetrics,
  notifyStakeholders,
  createSupabaseAdmin
};
