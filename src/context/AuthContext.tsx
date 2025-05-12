
import { createContext, useContext } from 'react';
import { AuthContextType } from '@/lib/auth/types';

/**
 * AuthContext provides authentication state and methods to the React component tree
 */
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  signIn: async () => ({ success: false, error: 'Not implemented' }),
  signUp: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => ({ success: false, error: 'Not implemented' }),
  resetPassword: async () => ({ success: false, error: 'Not implemented' }),
  updatePassword: async () => ({ success: false, error: 'Not implemented' }),
  refreshSession: async () => ({ success: false, error: 'Not implemented' }),
  checkUserRole: async () => null
});

/**
 * AuthProvider component to wrap the app and provide authentication context
 */
export const AuthProvider = AuthContext.Provider;

/**
 * useAuth hook to access the authentication context
 */
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
