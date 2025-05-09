
import { User, AuthError } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // For backward compatibility
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}
