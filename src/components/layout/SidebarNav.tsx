import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';

import {
  Home,
  ArrowRight,
  Plug,
  Users,
  LayoutGrid,
  BarChart,
  Calendar,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export const SidebarNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentTenant } = useWorkspace();

  // Define navigation groups
  const mainNavItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/',
    },
    {
      title: 'Strategy Engine',
      icon: ArrowRight,
      path: '/launch',
    },
    {
      title: 'Plugins',
      icon: Plug,
      path: '/plugins',
    },
    {
      title: 'Galaxy Explorer',
      icon: LayoutGrid,
      path: '/explore',
    },
  ];

  const insightsNavItems = [
    {
      title: 'Agent Performance',
      icon: Users,
      path: '/agents/performance',
    },
    {
      title: 'KPI Dashboard',
      icon: BarChart,
      path: '/insights/kpis',
    },
  ];

  const adminNavItems = [
    {
      title: 'AI Decisions',
      icon: Shield,
      path: '/admin/ai-decisions',
    },
    {
      title: 'Plugin Logs',
      icon: Calendar,
      path: '/admin/plugin-logs',
    },
    {
      title: 'System Logs',
      icon: Calendar,
      path: '/admin/system-logs',
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Deletion Requests',
      icon: Calendar,
      path: '/admin/deletion-requests',
    },
  ];

  const handleSignOut = async () => {
    await signOut?.();
    navigate('/auth');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    // Handle root path separately
    if (path === '/' && location.pathname === '/') return true;
    
    // For other paths, check if the current path starts with the link path
    return path !== '/' && location.pathname.startsWith(path);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentTenant?.logo_url || ''} alt={currentTenant?.name || 'Tenant'} />
            <AvatarFallback>{currentTenant?.name?.substring(0, 2) || 'A'}</AvatarFallback>
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
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Insights</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {insightsNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarNav;
