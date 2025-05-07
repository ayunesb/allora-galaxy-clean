
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { SidebarMenuButton } from '@/components/ui/sidebar';

interface SidebarFooterActionsProps {
  isActive: (path: string) => boolean;
}

export const SidebarFooterActions: React.FC<SidebarFooterActionsProps> = ({ isActive }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  const handleSignOut = async () => {
    await signOut?.();
    navigate('/auth');
  };

  return (
    <div className="space-y-2 px-2">
      <SidebarMenuButton
        isActive={isActive('/settings')}
        tooltip="Settings"
        onClick={() => handleNavigation('/settings')}
      >
        <Settings className="h-5 w-5" />
        <span>Settings</span>
      </SidebarMenuButton>
      
      <Button
        variant="outline"
        className="w-full justify-start"
        size="sm"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
};
