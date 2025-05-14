export interface SystemLog {
  id: string;
  created_at: string;
  module: string;
  event: string;
  level: string;
  description: string;
  context: Record<string, any>;
  tenant_id: string;
}

// Add TrendDirection enum definition 
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  NEUTRAL = 'neutral'
}

// Add NavigationItem type
export interface NavigationItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  href: string;
  badge?: string | number;
  items?: NavigationItem[];
  permission?: string;
}

// Add or update SystemLogFilter type
export interface SystemLogFilter {
  searchTerm?: string;
  module?: SystemEventModule;
  level?: 'info' | 'warning' | 'error';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Add or ensure SystemEventModule type exists
export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'tenant' 
  | 'api' 
  | 'user' 
  | 'system';
