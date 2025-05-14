
/**
 * User roles within the application
 */
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest' | 'user';

/**
 * Tenant object representing a workspace
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

/**
 * User object
 */
export interface AppUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRole;
  createdAt?: string;
  metadata?: Record<string, any>;
  user_metadata?: Record<string, any>; // Added this to fix error
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Onboarding step
 */
export type OnboardingStep = 
  | 'welcome'
  | 'company'
  | 'persona'
  | 'workspace'
  | 'complete'
  | 'company-info'
  | 'additional-info'
  | 'strategy-generation';

/**
 * Navigation item
 */
export interface NavigationItem {
  title: string;
  href: string;
  icon?: any;
  description?: string;
  id?: string; // Added id to fix WorkspaceContext errors
  items?: NavigationItem[];
  adminOnly?: boolean;
  badge?: string | number;
  isNew?: boolean;
}

/**
 * Vote type
 */
export type VoteType = 'up' | 'down';

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Filter state
 */
export interface FilterState {
  module?: string[];
  eventType?: string[];
  dateRange?: {
    from: Date | string | null;
    to: Date | string | null;
  };
  status?: string[];
  search?: string;
}

/**
 * Notification type
 */
export type NotificationType = 'system' | 'strategy' | 'agent' | 'alert' | 'update' | 'info' | 'success' | 'warning' | 'error';

/**
 * Date range type for consistent date range handling
 */
export interface DateRange {
  from: Date | null;
  to?: Date | null;
}
