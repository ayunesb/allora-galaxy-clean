
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from './use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Types for authentication
export type AuthUser = User;

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: Error | null }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ user: AuthUser | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);
        });
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Error initializing authentication:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      // Log successful sign in
      await logSystemEvent('auth', 'info', {
        event_type: 'user_signin',
        user_id: data.user?.id
      });
      
      toast({
        title: 'Signed in successfully',
        description: `Welcome back, ${data.user?.email}`,
      });
      
      return { user: data.user, error: null };
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err);
      
      toast({
        title: 'Sign in failed',
        description: err.message || 'Failed to sign in',
        variant: 'destructive',
      });
      
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, metadata?: object) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Log successful sign up
      await logSystemEvent('auth', 'info', {
        event_type: 'user_signup',
        user_id: data.user?.id
      });
      
      toast({
        title: 'Signed up successfully',
        description: 'Please check your email to verify your account',
      });
      
      return { user: data.user, error: null };
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(err);
      
      toast({
        title: 'Sign up failed',
        description: err.message || 'Failed to sign up',
        variant: 'destructive',
      });
      
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user?.id;
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      // Log successful sign out
      if (userId) {
        await logSystemEvent('auth', 'info', {
          event_type: 'user_signout',
          user_id: userId
        });
      }
      
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out',
      });
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err);
      
      toast({
        title: 'Sign out failed',
        description: err.message || 'Failed to sign out',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });
      
      if (resetError) {
        throw resetError;
      }
      
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email to reset your password',
      });
      
      return { error: null };
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err);
      
      toast({
        title: 'Password reset failed',
        description: err.message || 'Failed to send password reset email',
        variant: 'destructive',
      });
      
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });
      
      return { error: null };
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err);
      
      toast({
        title: 'Password update failed',
        description: err.message || 'Failed to update password',
        variant: 'destructive',
      });
      
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        throw refreshError;
      }
      
      setSession(data.session);
      setUser(data.user);
    } catch (err: any) {
      console.error('Error refreshing session:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default useAuth;
