
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
  refreshSession: () => Promise<AuthResponse>;
  checkUserRole: (tenantId: string, requiredRoles: string[]) => Promise<boolean | null>;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}
