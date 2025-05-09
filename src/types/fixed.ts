
// Type definitions for snake_case API parameters and responses

export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id: string;
  status: 'completed' | 'failed' | 'pending';
  execution_time: number;
  execution_id?: string;
  error?: string;
  details?: any;
}

export interface SnakeCaseExecutionResult {
  success: boolean;
  execution_id: string;
  execution_time: number;
  error?: string;
}

export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type SnakeCasify<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K] extends object
    ? SnakeCasify<T[K]>
    : T[K];
};
