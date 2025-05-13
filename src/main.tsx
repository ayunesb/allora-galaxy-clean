
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { routes } from '@/routes';
import { AuthContextType, AuthResponse } from '@/lib/auth/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

// Create the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Create the router
const router = createBrowserRouter(routes);

// Define the root component
const Root = () => {
  // Initial auth state
  const authState: AuthContextType = {
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
  };

  // Note: actual auth logic would be implemented here and update the authState
  // This is a placeholder for future implementation

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider value={authState}>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
