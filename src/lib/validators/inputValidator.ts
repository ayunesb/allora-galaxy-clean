
/**
 * Utility for validating inputs in edge functions and client-side operations
 */

type ValidationRule<T> = {
  test: (value: T) => boolean;
  message: string;
};

/**
 * Generic validation function that validates an object against a set of rules
 */
export function validateObject<T extends Record<string, any>>(
  obj: T,
  rules: Record<keyof T, ValidationRule<T[keyof T]>[]>
): { valid: boolean; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = obj[field];
    const fieldErrors: string[] = [];
    
    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Common validation rules that can be used across the application
 */
export const rules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    test: (value: T) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      return true;
    },
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true; // Skip if empty (use required rule to check for emptiness)
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be at most ${max} characters`
  }),
  
  isEmail: (message = 'Invalid email address'): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),
  
  isUuid: (message = 'Invalid UUID format'): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value);
    },
    message
  }),
  
  isOneOf: <T>(options: T[], message?: string): ValidationRule<T> => ({
    test: (value: T) => {
      if (value === undefined || value === null) return true;
      return options.includes(value);
    },
    message: message || `Must be one of: ${options.join(', ')}`
  }),
  
  isNumber: (message = 'Must be a number'): ValidationRule<any> => ({
    test: (value: any) => {
      if (value === undefined || value === null || value === '') return true;
      return !isNaN(Number(value));
    },
    message
  }),
  
  min: (min: number, message?: string): ValidationRule<number> => ({
    test: (value: number) => {
      if (value === undefined || value === null) return true;
      return value >= min;
    },
    message: message || `Must be at least ${min}`
  }),
  
  max: (max: number, message?: string): ValidationRule<number> => ({
    test: (value: number) => {
      if (value === undefined || value === null) return true;
      return value <= max;
    },
    message: message || `Must be at most ${max}`
  }),
  
  isUrl: (message = 'Invalid URL format'): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  }),
  
  matches: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    test: (value: string) => {
      if (!value) return true;
      return regex.test(value);
    },
    message
  }),
  
  custom: <T>(testFn: (value: T) => boolean, message: string): ValidationRule<T> => ({
    test: testFn,
    message
  })
};

/**
 * Validates a specific value against a set of validation rules
 */
export function validateValue<T>(
  value: T, 
  validationRules: ValidationRule<T>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const rule of validationRules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates array inputs according to their type
 */
export function validateArray<T>(
  arr: T[],
  itemValidator: (item: T) => boolean,
  options: { message?: string; minLength?: number; maxLength?: number } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { minLength, maxLength, message = 'Invalid array item' } = options;
  
  if (minLength !== undefined && arr.length < minLength) {
    errors.push(`Must have at least ${minLength} items`);
  }
  
  if (maxLength !== undefined && arr.length > maxLength) {
    errors.push(`Must have at most ${maxLength} items`);
  }
  
  for (let i = 0; i < arr.length; i++) {
    if (!itemValidator(arr[i])) {
      errors.push(`Item at index ${i}: ${message}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a schema validator for a specific type of object
 */
export function createValidator<T extends Record<string, any>>(
  schema: Record<keyof T, ValidationRule<T[keyof T]>[]>
) {
  return (obj: T) => validateObject(obj, schema);
}
