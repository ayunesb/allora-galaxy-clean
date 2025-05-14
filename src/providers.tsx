
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { NotificationsProvider } from '@/context/notifications/NotificationsProvider';
import { ToastProvider } from '@/components/ui/toast-provider';
import ThemeUiProvider from './providers/ThemeUiProvider';

const queryClient = new QueryClient();

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HelmetProvider>
          <ThemeProvider defaultTheme="light">
            <ThemeUiProvider>
              <AuthProvider>
                <WorkspaceProvider>
                  <NotificationsProvider>
                    <ToastProvider>
                      {children}
                    </ToastProvider>
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
