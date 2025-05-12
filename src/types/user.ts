
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'owner' | 'member' | 'viewer' | 'guest';
export type UserRoleType = UserRole; // For backward compatibility

export interface UserWithProfile extends User {
  profile?: Profile;
  role?: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, any>;
}

export interface PasswordResetCredentials {
  password: string;
}
