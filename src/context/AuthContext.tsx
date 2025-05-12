import React, { createContext, useContext } from 'react';
import useAuthHook from '@/hooks/useAuth';
import { AuthContextType } from '@/lib/auth/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsProvider } from './NotificationsContext';

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
  const auth = useAuthHook();
  
  return (
    // No <BrowserRouter> or <Router> here
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a QueryClient instance
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
