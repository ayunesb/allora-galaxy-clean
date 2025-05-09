
import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

// Re-export the auth provider and hook from our hooks implementation
export const AuthContext = createContext<ReturnType<typeof useAuthHook> | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// This is a stub component that redirects to the new implementation
// to maintain backward compatibility
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>; 
};
