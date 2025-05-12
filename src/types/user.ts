
// User and profile related types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  onboarding_completed?: boolean;
}

// User role types
export type UserRoleType = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}
