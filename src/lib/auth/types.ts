
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  refreshSession: () => Promise<AuthResult>;
  checkUserRole: (tenantId: string, requiredRoles: string[]) => Promise<boolean | null>;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  user?: User | null;
  session?: Session | null;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface WeakPassword {
  isWeak: boolean;
  message?: string;
}

// Alias for backward compatibility
export type AuthResponse = AuthResult;
