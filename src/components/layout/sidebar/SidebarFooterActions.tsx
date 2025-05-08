
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

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
      <Button
        variant="ghost"
        className={`w-full justify-start ${isActive('/settings') ? 'bg-primary/10' : ''}`}
        onClick={() => handleNavigation('/settings')}
      >
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </Button>
      
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

export default SidebarFooterActions;
