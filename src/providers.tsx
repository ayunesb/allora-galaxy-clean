import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { NotificationsProvider } from './lib/notifications/NotificationsProvider';
import ThemeUiProvider from './providers/ThemeUiProvider';

const queryClient = new QueryClient();

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HelmetProvider>
          <ThemeProvider>
            <ThemeUiProvider>
              <AuthProvider>
                <WorkspaceProvider>
                  <NotificationsProvider>
                    <Toaster />
                    {children}
                  </NotificationsProvider>
                </WorkspaceProvider>
              </AuthProvider>
            </ThemeUiProvider>
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
