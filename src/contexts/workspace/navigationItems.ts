import { Home, Bell, Settings, Users, BarChart2, Brain, ListChecks, LayoutDashboard, Plugin, FileCode2, Terminal, HelpCircle } from 'lucide-react';
import { NavigationItem } from '@/types/shared';

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'strategies',
    title: 'Strategies',
    icon: ListChecks,
    href: '/strategies',
  },
  {
    id: 'agents',
    title: 'Agents',
    icon: Brain,
    href: '/agents',
  },
  {
    id: 'galaxy',
    title: 'Galaxy',
    icon: Home,
    href: '/galaxy',
  },
  {
    id: 'insights',
    title: 'Insights',
    icon: BarChart2,
    href: '/insights/kpis',
    items: [
      {
        id: 'kpis',
        title: 'KPIs',
        href: '/insights/kpis',
      },
      {
        id: 'reports',
        title: 'Reports',
        href: '/insights/reports',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    badge: 0,
  },
  {
    id: 'plugins',
    title: 'Plugins',
    icon: Plugin,
    href: '/plugins',
  },
  {
    id: 'admin',
    title: 'Admin',
    icon: Terminal,
    href: '/admin/system-logs',
    permission: 'admin',
    items: [
      {
        id: 'system-logs',
        title: 'System Logs',
        href: '/admin/system-logs',
        icon: FileCode2,
      },
      {
        id: 'ai-decisions',
        title: 'AI Decisions',
        href: '/admin/ai-decisions',
        icon: Brain,
      },
      {
        id: 'users',
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'help',
    title: 'Help',
    icon: HelpCircle,
    href: '/help',
  },
];
