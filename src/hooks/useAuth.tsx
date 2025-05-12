
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@/lib/supabase';
import { AuthContextType, AuthResult, WeakPassword } from '@/lib/auth/types';

function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for weak password
  const checkPasswordStrength = (password: string): WeakPassword => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    if (password.length < minLength) {
      return { isWeak: true, message: 'Password should be at least 8 characters long' };
    }
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
      return { 
        isWeak: true, 
        message: 'Password should contain uppercase, lowercase, numbers, and special characters'
      };
    }
    
    return { isWeak: false };
  };

  // Fetch the session on component mount
  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setIsAuthenticated(!!data.session);
        
        if (data.session?.user) {
          setUser(data.session.user);
        }
      } catch (err: any) {
        console.error('Error fetching session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err: any) {
      console.error('Sign in error:', err);
      return { success: false, error: err.message || 'Failed to sign in' };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, any>): Promise<AuthResult> => {
    try {
      // Check password strength
      const passwordCheck = checkPasswordStrength(password);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) {
        throw error;
      }

      return { 
        success: true, 
        data: {
          ...data,
          weakPassword: passwordCheck
        } 
      };
    } catch (err: any) {
      console.error('Sign up error:', err);
      return { success: false, error: err.message || 'Failed to sign up' };
    }
  };

  // Sign out function
  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Sign out error:', err);
      return { success: false, error: err.message || 'Failed to sign out' };
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Reset password error:', err);
      return { success: false, error: err.message || 'Failed to reset password' };
    }
  };

  // Update password
  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Update password error:', err);
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  // Refresh session
  const refreshSession = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      setSession(data.session);
      setUser(data.user);
      setIsAuthenticated(!!data.session);
      
      return { success: true };
    } catch (err: any) {
      console.error('Refresh session error:', err);
      return { success: false, error: err.message || 'Failed to refresh session' };
    }
  };

  // Check user role for a specific tenant
  const checkUserRole = async (tenantId: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select('role')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking user role:', error);
        return null;
      }
      
      return data?.role || null;
    } catch (err) {
      console.error('Error checking user role:', err);
      return null;
    }
  };

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    checkUserRole
  };
}

export default useAuth;
