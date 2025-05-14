
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import SidebarNav from './SidebarNav';
import { getNavigationItems } from '@/contexts/workspace/navigationItems';
import { useRBAC } from '@/hooks/useRBAC';

interface MobileSidebarProps {
  onItemClick: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ onItemClick }) => {
  const { isAdmin } = useRBAC();
  const navigationItems = getNavigationItems(isAdmin());
  
  return (
    <div className="fixed inset-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-full flex-col bg-background shadow-xl animate-in slide-in-from-left">
      <div className="container flex items-center justify-between py-4">
        <h2 className="text-lg font-medium">Navigation</h2>
        <Button variant="ghost" size="sm" onClick={onItemClick}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <div className="container pb-12 pt-4">
        <SidebarNav items={navigationItems} className="px-1" />
      </div>
    </div>
  );
};

export default MobileSidebar;
