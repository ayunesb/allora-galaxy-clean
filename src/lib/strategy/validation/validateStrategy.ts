
import { ValidationResult } from '../../strategy/types';

/**
 * Validate strategy execution input
 * @param input The input to validate
 * @returns Validation result
 */
export function validateInput(input: any): ValidationResult {
  const errors: string[] = [];
  
  if (!input) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!input.strategy_id) {
    errors.push("strategy_id is required");
  }
  
  if (!input.tenant_id) {
    errors.push("tenant_id is required");
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Function to validate strategy parameters
 */
export function validateStrategyParameters(params: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Define required parameters
  const requiredParams = ['name', 'description'];
  
  // Check if all required parameters are provided
  for (const param of requiredParams) {
    if (!params[param]) {
      errors.push(`Missing required parameter: ${param}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
