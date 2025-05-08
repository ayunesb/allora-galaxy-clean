
import { ValidationResult } from '@/types/strategy';

/**
 * Validates input parameters for strategy execution
 * @param input The input object to validate
 * @returns ValidationResult with valid flag and error message if invalid
 */
export function validateStrategyInput(input: any): ValidationResult {
  if (!input) {
    return {
      valid: false,
      error: 'Strategy ID is required'
    };
  }
  
  // Check if strategyId is present (for camelCase format)
  if (!input.strategyId && !input.strategy_id) {
    return {
      valid: false,
      error: 'Strategy ID is required'
    };
  }
  
  // Check if tenantId is present (for camelCase format)
  if (!input.tenantId && !input.tenant_id) {
    return {
      valid: false,
      error: 'Tenant ID is required'
    };
  }
  
  return { valid: true };
}
