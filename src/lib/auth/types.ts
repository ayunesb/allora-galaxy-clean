
import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { UserRole } from '@/types/shared';

export interface User extends SupabaseUser {
  role?: UserRole;
  tenantId?: string;
}

export type Session = SupabaseSession;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: any) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
