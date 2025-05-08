
import { NavigationItem } from '@/types/navigation';
import { 
  Home, 
  LayoutGrid, 
  Plugin, 
  Sparkle, 
  BarChart3, 
  Rocket, 
  Settings, 
  ShieldAlert, 
  Users, 
  FileText, 
  AlertCircle, 
  Layers 
} from 'lucide-react';

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    path: '/galaxy',
    icon: LayoutGrid
  },
  {
    id: 'plugins',
    label: 'Plugins',
    path: '/plugins',
    icon: Plugin
  },
  {
    id: 'agents',
    label: 'Agents',
    path: '/agents/performance',
    icon: Sparkle
  },
  {
    id: 'insights',
    label: 'Insights',
    path: '/insights/kpis',
    icon: BarChart3
  },
  {
    id: 'launch',
    label: 'Launch',
    path: '/launch',
    icon: Rocket
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: ShieldAlert,
    isAdmin: true,
    children: [
      {
        id: 'admin-users',
        label: 'Users',
        path: '/admin/users',
        icon: Users,
        isAdmin: true
      },
      {
        id: 'admin-plugin-logs',
        label: 'Plugin Logs',
        path: '/admin/plugin-logs',
        icon: FileText,
        isAdmin: true
      },
      {
        id: 'admin-ai-decisions',
        label: 'AI Decisions',
        path: '/admin/ai-decisions',
        icon: Sparkle,
        isAdmin: true
      },
      {
        id: 'admin-system-logs',
        label: 'System Logs',
        path: '/admin/system-logs',
        icon: AlertCircle,
        isAdmin: true
      }
    ]
  }
];
