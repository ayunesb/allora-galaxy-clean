
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/shared';

export interface AuthUser extends User {
  role?: UserRole;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthSession {
  user: AuthUser | null;
  session: Session | null;
}

export interface AuthState extends AuthSession {
  isLoading: boolean;  // Changed from loading to isLoading for consistency
  error: AuthError | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  metadata?: Record<string, any>;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;  // Changed from loading to isLoading for consistency
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, metadata?: object) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  checkUserRole: (role: string | string[]) => Promise<boolean>;
  userRole?: UserRole | null;
}
