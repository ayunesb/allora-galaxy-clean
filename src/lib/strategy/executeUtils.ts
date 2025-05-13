
import { ExecuteStrategyInput } from '@/types/fixed/execution';

// Define types for the strategy execution
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  logs?: any[];
}

// Utility function to handle errors in strategy execution
export function handleExecutionError(error: any): ExecutionResult {
  console.error('Error executing strategy:', error);
  return {
    success: false,
    error: error.message || 'Unknown error occurred during strategy execution'
  };
}

// Utility function to validate strategy input
export function validateStrategyInput(input: ExecuteStrategyInput): { valid: boolean; error?: string } {
  if (!input.strategy_id) {
    return { valid: false, error: 'Strategy ID is required' };
  }
  
  if (!input.tenant_id) {
    return { valid: false, error: 'Tenant ID is required' };
  }
  
  return { valid: true };
}

// Format the execution result for response
export function formatExecutionResult(result: any): ExecutionResult {
  return {
    success: true,
    data: result
  };
}

// Record the execution progress
export function recordProgress(strategyId: string, progress: number): Promise<void> {
  console.log(`Recording progress for strategy ${strategyId}: ${progress}%`);
  // Implementation to update progress in database would go here
  return Promise.resolve();
}
