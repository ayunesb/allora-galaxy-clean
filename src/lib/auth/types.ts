
import { User, Session } from '@/lib/supabase';

export interface WeakPassword {
  isWeak: boolean;
  message?: string;
}

export interface AuthResult {
  success: boolean;
  data?: {
    user: User;
    session: Session;
    weakPassword?: WeakPassword;
  };
  error?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: Error;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResult>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<{ success: boolean; error?: string }>;
  checkUserRole: (tenantId: string) => Promise<string | null>;
}
