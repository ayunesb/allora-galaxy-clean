
import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserAccountNav from '@/components/layout/UserAccountNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationCenter } from '@/components/layout/NotificationCenter';

export interface HeaderProps {
  title?: string; 
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { navigation, workspace } = useWorkspace();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          {navigation && workspace && (
            <h1 className="text-lg font-medium">{workspace.name}</h1>
          )}
          {children}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <NotificationBell 
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {showNotifications && (
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            )}
          </div>
          <ThemeSwitcher />
          <UserAccountNav />
        </div>
      </div>
    </header>
  );
}
