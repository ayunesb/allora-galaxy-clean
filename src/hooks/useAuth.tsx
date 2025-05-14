
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  // Add other properties as needed
};

type UserRole = 'admin' | 'user' | 'manager' | 'owner';

type AuthContextType = {
  user: AuthUser | null;
  userRole: UserRole | null;
  session: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  checkUserRole: (role: string | string[]) => Promise<boolean>;
  hasRole: (role: string | string[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Fetch user role if we have a user
        if (session?.user) {
          try {
            const { data, error } = await supabase
              .from('tenant_user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();

            if (error) throw error;
            setUserRole(data?.role as UserRole || null);
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('tenant_user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (error) throw error;
          setUserRole(data?.role as UserRole || null);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();

    // Clean up subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      toast.error('Failed to sign in: ' + (error as Error).message);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Sign up successful! Please check your email for verification.');
      return { error: null };
    } catch (error) {
      toast.error('Failed to sign up: ' + (error as Error).message);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      toast.error('Failed to sign out: ' + (error as Error).message);
      return { error };
    }
  };

  // Reset password (sends email with reset link)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset email sent. Please check your inbox.');
      return { error: null };
    } catch (error) {
      toast.error('Failed to send reset email: ' + (error as Error).message);
      return { error };
    }
  };

  // Update password (after reset)
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated successfully.');
      return { error: null };
    } catch (error) {
      toast.error('Failed to update password: ' + (error as Error).message);
      return { error };
    }
  };

  // Check if user has the specified role
  const checkUserRole = async (role: string | string[]): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (!data || data.length === 0) return false;
      
      const userRoles = data.map(r => r.role);
      
      if (Array.isArray(role)) {
        return role.some(r => userRoles.includes(r));
      } else {
        return userRoles.includes(role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  };

  // Synchronous role check based on current userRole state
  const hasRole = (role: string | string[]): boolean => {
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    } else {
      return role === userRole;
    }
  };

  const value = {
    user,
    userRole,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    checkUserRole,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
