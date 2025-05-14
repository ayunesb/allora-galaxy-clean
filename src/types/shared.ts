
// Define shared types used across the application

// User and Auth related types
export type UserRole = 'admin' | 'owner' | 'member' | 'guest';

// Export with 'export type' for better TypeScript module isolation
export type VoteType = 'up' | 'down' | 'neutral';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type FilterState = {
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  module?: string;
  severity?: string[];
};

export type SystemEventModule = 
  | 'system' 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'tenant' 
  | 'integration';

export type LogSeverity = 'info' | 'warn' | 'error' | 'debug';

export type SystemLogFilter = {
  module?: SystemEventModule[];
  severity?: LogSeverity[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  search?: string;
};

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export type OnboardingStep = 'welcome' | 'company' | 'persona' | 'generate' | 'complete';

// Calendar & DateRange related types
export interface DateRange {
  from: Date;
  to?: Date | undefined;
}

// Navigation types
export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  adminOnly?: boolean;
  badge?: string | number;
  isNew?: boolean;
  isExternal?: boolean;
}
