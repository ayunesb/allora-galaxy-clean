
/**
 * Convert camelCase string to snake_case
 * @param str The string to convert
 * @returns The converted string
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert camelCase object keys to snake_case
 * @param obj The object to convert
 * @returns A new object with snake_case keys
 */
export function camelToSnakeObject<T extends object>(obj: T): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key);
    const value = obj[key as keyof T];
    
    // Recursively handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      acc[snakeKey] = camelToSnakeObject(value);
    } else {
      acc[snakeKey] = value;
    }
    
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Convert snake_case string to camelCase
 * @param str The string to convert
 * @returns The converted string
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert snake_case object keys to camelCase
 * @param obj The object to convert
 * @returns A new object with camelCase keys
 */
export function snakeToCamelObject<T extends object>(obj: T): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key);
    const value = obj[key as keyof T];
    
    // Recursively handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      acc[camelKey] = snakeToCamelObject(value);
    } else {
      acc[camelKey] = value;
    }
    
    return acc;
  }, {} as Record<string, any>);
}
