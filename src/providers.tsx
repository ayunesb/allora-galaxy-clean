
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { SidebarProvider } from './components/ui/sidebar';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './components/theme/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="allora-theme">
          <AuthProvider>
            <WorkspaceProvider>
              <NotificationsProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </NotificationsProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default Providers;
