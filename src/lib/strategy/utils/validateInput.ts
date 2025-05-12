
import { ValidationResult } from '@/types/strategy';

/**
 * Validate input for strategy execution
 * @param strategy The strategy data to validate
 * @returns A validation result object
 */
export function validateInput(strategy: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!strategy) {
    errors["strategy"] = 'Strategy is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
