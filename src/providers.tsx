
import React from 'react';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { SidebarProvider } from '@/components/ui/sidebar';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <WorkspaceProvider>
      <NotificationsProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </NotificationsProvider>
    </WorkspaceProvider>
  );
};
