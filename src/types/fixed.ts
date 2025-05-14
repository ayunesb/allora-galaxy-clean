
/**
 * Fixed types for strategy execution
 */

export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  params?: Record<string, any>;
  options?: {
    debug?: boolean;
    timeout?: number;
    agent_id?: string;
    log_level?: 'debug' | 'info' | 'warn' | 'error';
    [key: string]: any;
  };
}

export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  executionTime?: number;
  status?: string;
  results?: any;
  outputs?: Record<string, any>;
  error?: string;
  logs?: any[];
  xpEarned?: number;
  pluginsExecuted?: number;
  successfulPlugins?: number;
}

/**
 * Workspace and tenant types
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  logo_url?: string;
  settings?: Record<string, any>;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  active?: boolean;
}

/**
 * User and authentication types
 */
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
