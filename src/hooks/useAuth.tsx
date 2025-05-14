
// No longer just re-exporting, implement a proper hook with full authentication functionality
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/shared';

export interface AuthUser {
  id: string;
  email?: string;
  role?: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  userRole: UserRole | null;
  session: any | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    userRole: null,
    session: null,
    isLoading: true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // First set up the auth listener for future state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({ ...prev, session, user: session?.user ?? null }));
        
        if (session?.user) {
          // Fetch user role
          try {
            const { data: roleData } = await supabase
              .from('tenant_user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            setState(prev => ({ ...prev, userRole: roleData?.role as UserRole || null }));
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        } else {
          setState(prev => ({ ...prev, userRole: null }));
        }
      }
    );

    // Then check for existing session
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          setState(prev => ({ ...prev, session: data.session, user: data.session.user }));
          
          // Fetch user role
          try {
            const { data: roleData } = await supabase
              .from('tenant_user_roles')
              .select('role')
              .eq('user_id', data.session.user.id)
              .single();
            
            setState(prev => ({ ...prev, userRole: roleData?.role as UserRole || null }));
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      // Redirect to where user was trying to go, or to dashboard
      const origin = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(origin);
      
      toast({
        title: "Welcome back",
        description: "You have successfully signed in",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/login');
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
        variant: "success",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const checkUserRole = async (role: string | string[]): Promise<boolean> => {
    if (!state.user) return false;
    
    // If no role is required, just check if user is authenticated
    if (!role) return true;
    
    const roles = Array.isArray(role) ? role : [role];
    
    // Admin and owner roles can access everything
    if (state.userRole === 'admin' || state.userRole === 'owner') {
      return true;
    }
    
    // Check if user's role is in the required roles
    return roles.includes(state.userRole as string);
  };

  return { 
    user: state.user, 
    userRole: state.userRole,
    session: state.session, 
    isLoading: state.isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    checkUserRole
  };
}

export default useAuth;
