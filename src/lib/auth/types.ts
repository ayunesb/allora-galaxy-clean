
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthSession {
  user: AuthUser | null;
  session: Session | null;
}

export interface AuthState extends AuthSession {
  loading: boolean;
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
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, metadata?: object) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  checkUserRole: (role: string) => Promise<boolean>;
}
