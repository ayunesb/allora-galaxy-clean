
import React from 'react';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <WorkspaceProvider>
        <NotificationsProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </NotificationsProvider>
      </WorkspaceProvider>
    </HelmetProvider>
  );
};

export { NextThemeProvider };
export default Providers;
