
import { ExecuteStrategyParams, ValidationResult } from '../types';

/**
 * Validates the input for strategy execution
 * @param input The input to validate
 * @returns An object indicating if the input is valid and any errors
 */
export function validateInput(input: ExecuteStrategyParams): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!input.strategy_id) {
    errors.push('strategy_id is required');
  }
  
  if (!input.tenant_id) {
    errors.push('tenant_id is required');
  }
  
  // Validate options if provided
  if (input.options) {
    if (typeof input.options.dryRun !== 'undefined' && typeof input.options.dryRun !== 'boolean') {
      errors.push('options.dryRun must be a boolean');
    }
    
    if (typeof input.options.force !== 'undefined' && typeof input.options.force !== 'boolean') {
      errors.push('options.force must be a boolean');
    }
    
    if (typeof input.options.timeout !== 'undefined') {
      if (typeof input.options.timeout !== 'number') {
        errors.push('options.timeout must be a number');
      } else if (input.options.timeout <= 0) {
        warnings.push('options.timeout should be a positive number');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
