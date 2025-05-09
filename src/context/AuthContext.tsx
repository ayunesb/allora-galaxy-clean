
import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook, AuthProvider as AuthProviderImpl } from '@/hooks/useAuth';

// Re-export the auth provider and hook from our hooks implementation
export const AuthContext = createContext<ReturnType<typeof useAuthHook> | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Connect the implementation to the context provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderImpl>{children}</AuthProviderImpl>;
};
