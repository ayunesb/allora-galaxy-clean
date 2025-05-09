
// Type definitions for shared resources across the application

// System event module types
export type SystemEventModule = 'strategy' | 'plugin' | 'agent' | 'auth' | 'system' | string;

// System event types
export type SystemEventType = 'info' | 'warning' | 'error' | 'success' | 'strategy_executed' | 
                            'plugin_executed' | 'agent_evolved' | 'user_login' | 'user_logout' | string;

// Strategy statuses
export type StrategyStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'failed';

// Generic pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Generic filter parameters
export interface FilterParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any;
}
