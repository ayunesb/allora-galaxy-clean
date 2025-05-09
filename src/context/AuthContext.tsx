
import React, { createContext, useContext } from 'react';
import { useAuth as useSupabaseAuth, AuthProvider as AuthProviderImpl } from '@/hooks/useAuth';

// Create the context with proper typing for the auth values
export type AuthContextType = ReturnType<typeof useSupabaseAuth>;

// Create the context with undefined as initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the implementation from hooks/useAuth.tsx
  const auth = useSupabaseAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
