
/**
 * User related types for the application
 */

// Base user type
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

// User profile information
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  onboarding_completed?: boolean;
}

// User role types for tenant/workspace membership
export type UserRole = 'admin' | 'member' | 'owner' | 'guest' | 'viewer';
