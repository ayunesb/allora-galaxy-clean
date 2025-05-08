
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';

export interface SidebarProfileProps {
  className?: string;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ className }) => {
  const { currentTenant } = useWorkspace();
  const { user } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 ${className || ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentTenant?.metadata?.logo_url || ''} alt={currentTenant?.name || 'Tenant'} />
        <AvatarFallback>{currentTenant?.name ? getInitials(currentTenant.name) : 'A'}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none">
          {currentTenant?.name || 'Allora OS'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {user?.email?.split('@')[0] || 'User'}
        </p>
      </div>
    </div>
  );
};
