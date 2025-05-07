
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';

// Import our new components
import { NavItems } from './sidebar/NavItems';
import { SidebarProfile } from './sidebar/SidebarProfile';
import { SidebarFooterActions } from './sidebar/SidebarFooterActions';

export const SidebarNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    // Handle root path separately
    if (path === '/' && location.pathname === '/') return true;
    
    // For other paths, check if the current path starts with the link path
    return path !== '/' && location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarProfile />
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <NavItems 
            isActive={isActive}
            handleNavigation={handleNavigation}
          />
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterActions isActive={isActive} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
