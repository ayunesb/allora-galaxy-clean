
import { StrategyInput, ValidationResult } from '@/types/strategy';

/**
 * Validate a strategy input to ensure it meets requirements before submission
 * @param input The strategy input to validate 
 * @returns Validation result with status and any errors
 */
export function validateStrategyInput(input: StrategyInput): ValidationResult {
  const validationErrors: string[] = [];
  
  // Check title
  if (!input.title || input.title.trim().length < 3) {
    return {
      valid: false,
      errors: ['Title must be at least 3 characters long']
    };
  }
  
  // Check description
  if (!input.description || input.description.trim().length < 10) {
    return {
      valid: false,
      errors: ['Description must be at least 10 characters long']
    };
  }
  
  // Check due date if provided
  if (input.due_date) {
    const dueDate = new Date(input.due_date);
    if (isNaN(dueDate.getTime())) {
      return {
        valid: false,
        errors: ['Invalid due date format']
      };
    }
  }
  
  // All checks passed
  return {
    valid: true,
    errors: []
  };
}
