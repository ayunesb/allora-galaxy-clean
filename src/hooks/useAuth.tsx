
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthUser, AuthError } from '@/lib/auth/types';
import { 
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  signOutUser,
  resetUserPassword,
  updateUserPassword
} from '@/lib/auth/authUtils';

const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

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
    
    const response = await signInWithEmailAndPassword(email, password);
    
    setLoading(false);
    return response;
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, metadata?: object) => {
    setLoading(true);
    setError(null);
    
    const response = await signUpWithEmailAndPassword(email, password, metadata);
    
    setLoading(false);
    return response;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await signOutUser(user?.id);
    
    setLoading(false);
  }, [user]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    
    const response = await resetUserPassword(email);
    
    setLoading(false);
    return response;
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);
    
    const response = await updateUserPassword(newPassword);
    
    setLoading(false);
    return response;
  }, []);

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

  return {
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
};

export default useAuth;
