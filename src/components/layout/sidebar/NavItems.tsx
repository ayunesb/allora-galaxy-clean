
import React from 'react';
import {
  Home,
  ArrowRight,
  Plug,
  Users,
  LayoutGrid,
  BarChart,
  Shield,
  AlertCircle,
  Database,
  Settings,
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { hasRequiredRole } from '@/lib/requireRole';

// Define navigation groups as separate constants for better organization
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
    title: 'User Management',
    icon: Users,
    path: '/admin/users',
  },
  {
    title: 'System Logs',
    icon: AlertCircle,
    path: '/admin/system-logs',
  },
  {
    title: 'Plugin Logs',
    icon: Database,
    path: '/admin/plugin-logs',
  },
  {
    title: 'AI Decisions',
    icon: Shield,
    path: '/admin/ai-decisions',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/admin/settings',
  },
];

interface NavItemsProps {
  isActive: (path: string) => boolean;
  handleNavigation: (path: string) => void;
}

export const NavItems: React.FC<NavItemsProps> = ({ isActive, handleNavigation }) => {
  const isAdmin = hasRequiredRole(['admin', 'owner']);
  
  return (
    <>
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

      {isAdmin && (
        <>
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
        </>
      )}
    </>
  );
};
