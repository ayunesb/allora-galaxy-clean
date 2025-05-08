
import { NavigationItem } from '@/types/navigation';

// Define navigation items
export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'layout-dashboard'
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    path: '/galaxy',
    icon: 'grid-3x3'
  },
  {
    id: 'launch',
    label: 'Launch',
    path: '/launch',
    icon: 'rocket'
  },
  {
    id: 'agents',
    label: 'Agents',
    path: '/agents/performance',
    icon: 'bot'
  },
  {
    id: 'plugins',
    label: 'Plugins',
    path: '/plugins',
    icon: 'plug'
  },
  {
    id: 'insights',
    label: 'Insights',
    path: '/insights/kpis',
    icon: 'bar-chart'
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'settings',
    children: [
      {
        id: 'users',
        label: 'Users',
        path: '/admin/users',
        icon: 'users'
      },
      {
        id: 'ai-decisions',
        label: 'AI Decisions',
        path: '/admin/ai-decisions',
        icon: 'brain'
      },
      {
        id: 'system-logs',
        label: 'System Logs',
        path: '/admin/system-logs',
        icon: 'list'
      },
      {
        id: 'plugin-logs',
        label: 'Plugin Logs',
        path: '/admin/plugin-logs',
        icon: 'clipboard-list'
      }
    ]
  }
];
