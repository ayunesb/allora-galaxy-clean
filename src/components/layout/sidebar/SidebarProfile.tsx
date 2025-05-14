
import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const SidebarProfile = () => {
  const { currentTenant, userRole } = useWorkspace();
  const { user } = useAuth();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'UN';

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-primary/5 rounded-md">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium line-clamp-1">
            {currentTenant?.name || 'No workspace selected'}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {userRole || 'Guest'}
          </p>
        </div>
      </div>
    </div>
  );
};
