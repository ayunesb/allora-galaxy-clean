
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';
import { AuthContextType } from '@/lib/auth/types';
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOutUser,
  sendPasswordResetEmail,
  updateUserPassword,
  getCurrentSession
} from '@/lib/auth/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange((_) => {
      // Instead of duplicating the session check logic here, just call checkSession
      checkSession();
    });

    // Check if there's an active session
    const checkSession = async () => {
      try {
        const { session, error: sessionError } = await getCurrentSession();
        
        if (sessionError) {
          setError(sessionError);
        }
        
        setUser(session?.user || null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailPassword(email, password);
  };

  const signUp = async (email: string, password: string) => {
    return signUpWithEmailPassword(email, password);
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      setError(err as AuthError);
    }
  };

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(email);
  };

  const updatePassword = async (newPassword: string) => {
    return updateUserPassword(newPassword);
  };

  const value = {
    user,
    loading,
    isLoading: loading, // Add isLoading for backward compatibility
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
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
