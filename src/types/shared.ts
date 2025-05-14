
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
  | 'complete';

/**
 * Navigation item
 */
export interface NavigationItem {
  title: string;
  href: string;
  icon?: any;
  description?: string;
}
