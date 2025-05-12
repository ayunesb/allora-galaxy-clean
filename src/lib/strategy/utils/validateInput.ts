
import { ValidationResult } from '@/types/strategy';

/**
 * Validate input for strategy execution
 * @param strategy The strategy data to validate
 * @returns A validation result object
 */
export function validateInput(strategy: any): ValidationResult {
  const errors: string[] = [];
  
  if (!strategy) {
    errors.push('Strategy is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
