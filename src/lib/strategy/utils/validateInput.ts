
import { ExecuteStrategyInput } from '@/types/strategy';

/**
 * Validates input parameters for strategy execution
 * @param input Strategy execution input
 * @returns Validation result with error message if invalid
 */
export function validateStrategyInput(input: ExecuteStrategyInput | any): { 
  valid: boolean; 
  error?: string 
} {
  if (!input) {
    return { valid: false, error: 'Strategy execution input is required' };
  }
  
  // Check for strategy ID
  if (!input.strategyId && !input.strategy_id) {
    return { valid: false, error: 'Strategy ID is required' };
  }
  
  // Check for tenant ID
  if (!input.tenantId && !input.tenant_id) {
    return { valid: false, error: 'Tenant ID is required' };
  }
  
  return { valid: true };
}
