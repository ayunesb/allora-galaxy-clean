import React from 'react';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from './context/auth/AuthContext';


interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export { NextThemeProvider };
export default Providers;
