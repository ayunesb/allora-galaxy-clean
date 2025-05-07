
export type VoteType = 'up' | 'down';
export type LogStatus = 'success' | 'failure' | 'pending';
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

// Helper functions for snake_case <-> camelCase conversion
export function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as Record<string, any>);
}

export function snakeToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item)) as unknown as T;
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as Record<string, any>) as T;
}
