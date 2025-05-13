
/**
 * Validation utilities for Supabase Edge Functions
 */

/**
 * Object with validation functions for common types
 */
export const schemaBuilders = {
  string: (field: string, options: { required?: boolean; minLength?: number; maxLength?: number } = {}) => ({
    validate: (value: unknown): string | null => {
      if (value === undefined || value === null) {
        return options.required ? `${field} is required` : null;
      }
      
      if (typeof value !== 'string') {
        return `${field} must be a string`;
      }
      
      if (options.minLength !== undefined && value.length < options.minLength) {
        return `${field} must be at least ${options.minLength} characters`;
      }
      
      if (options.maxLength !== undefined && value.length > options.maxLength) {
        return `${field} must be at most ${options.maxLength} characters`;
      }
      
      return null;
    }
  }),
  
  number: (field: string, options: { required?: boolean; min?: number; max?: number } = {}) => ({
    validate: (value: unknown): string | null => {
      if (value === undefined || value === null) {
        return options.required ? `${field} is required` : null;
      }
      
      if (typeof value !== 'number' || isNaN(value)) {
        return `${field} must be a number`;
      }
      
      if (options.min !== undefined && value < options.min) {
        return `${field} must be at least ${options.min}`;
      }
      
      if (options.max !== undefined && value > options.max) {
        return `${field} must be at most ${options.max}`;
      }
      
      return null;
    }
  }),
  
  boolean: (field: string, options: { required?: boolean } = {}) => ({
    validate: (value: unknown): string | null => {
      if (value === undefined || value === null) {
        return options.required ? `${field} is required` : null;
      }
      
      if (typeof value !== 'boolean') {
        return `${field} must be a boolean`;
      }
      
      return null;
    }
  }),
  
  array: (field: string, options: { required?: boolean; minItems?: number; maxItems?: number } = {}) => ({
    validate: (value: unknown): string | null => {
      if (value === undefined || value === null) {
        return options.required ? `${field} is required` : null;
      }
      
      if (!Array.isArray(value)) {
        return `${field} must be an array`;
      }
      
      if (options.minItems !== undefined && value.length < options.minItems) {
        return `${field} must have at least ${options.minItems} items`;
      }
      
      if (options.maxItems !== undefined && value.length > options.maxItems) {
        return `${field} must have at most ${options.maxItems} items`;
      }
      
      return null;
    }
  }),
  
  email: (field: string, options: { required?: boolean } = {}) => ({
    validate: (value: unknown): string | null => {
      if (value === undefined || value === null || value === '') {
        return options.required ? `${field} is required` : null;
      }
      
      if (typeof value !== 'string') {
        return `${field} must be a string`;
      }
      
      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${field} must be a valid email address`;
      }
      
      return null;
    }
  }),
  
  uuid: (field: string, options: { required?: boolean } = {}) => ({
    validate: (value: unknown): string | null => {
      if (value === undefined || value === null || value === '') {
        return options.required ? `${field} is required` : null;
      }
      
      if (typeof value !== 'string') {
        return `${field} must be a string`;
      }
      
      // UUID validation regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        return `${field} must be a valid UUID`;
      }
      
      return null;
    }
  })
};

/**
 * Parse and validate request body
 * @param req Request object
 * @param validators Object with validation functions
 * @returns Validated data and errors
 */
export async function parseAndValidate<T>(
  req: Request,
  validators: Record<string, { validate: (value: unknown) => string | null }>
): Promise<{ data: Partial<T>; errors: Record<string, string> }> {
  let body: any;
  
  try {
    body = await req.json();
  } catch (error) {
    return {
      data: {},
      errors: { _error: 'Invalid JSON body' }
    };
  }
  
  const data: Partial<T> = {};
  const errors: Record<string, string> = {};
  
  for (const [field, validator] of Object.entries(validators)) {
    const value = body[field];
    const error = validator.validate(value);
    
    if (error === null) {
      // Only add the field to data if it's not undefined or null
      if (value !== undefined && value !== null) {
        data[field as keyof T] = value;
      }
    } else {
      errors[field] = error;
    }
  }
  
  return { data, errors };
}

/**
 * Validate input object against validators
 * @param input Input object to validate
 * @param validators Object with validation functions
 * @returns Array of validation errors
 */
export function validateInput<T>(
  input: Record<string, any>,
  validators: Record<string, { validate: (value: unknown) => string | null }>
): string[] {
  const errors: string[] = [];
  
  for (const [field, validator] of Object.entries(validators)) {
    const value = input[field];
    const error = validator.validate(value);
    
    if (error !== null) {
      errors.push(error);
    }
  }
  
  return errors;
}
