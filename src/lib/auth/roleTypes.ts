
// Define role types for the application
import type { UserRole } from '@/types/shared';

// Re-export with 'export type' syntax
export type { UserRole };

export type RoleBasedAccess = {
  role: UserRole | null;
  loading: boolean;
  error: Error | null;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
  isAdmin?: boolean; // Added for backward compatibility
};

export interface AuthUser {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    name?: string;
    [key: string]: any;
  };
  role?: UserRole;
  aud: string;
}

export interface AuthState {
  session: any | null;
  user: AuthUser | null;
  userRole: UserRole | null;
  isLoading: boolean;
}

export const isAdmin = (role: UserRole | null | undefined): boolean => {
  return role === 'admin' || role === 'owner';
};
