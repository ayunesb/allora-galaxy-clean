
import { ExecuteStrategyInput } from '@/types/fixed';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Validates the input for strategy execution
 * @param input The strategy execution input parameters
 * @returns Validation result
 */
export function validateInput(input: ExecuteStrategyInput | undefined): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if input exists
  if (!input) {
    errors.push('No input provided');
    return { valid: false, errors };
  }
  
  // Check required fields
  if (!input.strategyId) {
    errors.push('Strategy ID is required');
  }
  
  if (!input.tenantId) {
    errors.push('Tenant ID is required');
  }
  
  // Add warnings for optional fields that might be useful
  if (!input.userId) {
    warnings.push('User ID not provided, execution will be anonymous');
  }
  
  // Return validation result
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export default validateInput;
