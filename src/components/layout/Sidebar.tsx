
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationItem } from '@/types/shared';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SidebarProps {
  navigationItems: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigationItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useWorkspace();

  return (
    <div className="hidden md:flex flex-col border-r h-[calc(100vh-4rem)] w-64">
      <div className="p-4 border-b">
        <h2 className="font-semibold tracking-tight">
          {tenant?.name || 'Allora OS'}
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <Button
                key={index}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive ? "bg-secondary" : ""
                )}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p>Version: 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
