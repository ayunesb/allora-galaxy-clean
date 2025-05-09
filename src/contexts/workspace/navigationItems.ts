
import { NavigationItem } from '@/types/shared';
import {
  LayoutDashboard,
  Rocket,
  Globe,
  Puzzle,
  UserCog,
  BarChart3,
  Settings,
  UserCircle,
  FileCog,
  Users,
  AlertTriangle,
  KeyRound,
  Brain,
} from 'lucide-react';

export const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Launch',
    href: '/launch',
    icon: Rocket,
  },
  {
    name: 'Galaxy',
    href: '/galaxy',
    icon: Globe,
  },
  {
    name: 'Plugins',
    href: '/plugins',
    icon: Puzzle,
  },
  {
    name: 'Agents',
    href: '/agents/performance',
    icon: UserCog,
  },
  {
    name: 'Evolution',
    href: '/evolution',
    icon: Brain,
  },
  {
    name: 'Insights',
    href: '/insights/kpis',
    icon: BarChart3,
  },
  {
    name: 'Allora Brain',
    href: '/allora-brain',
    icon: Brain,
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Settings,
    requiresRole: ['admin', 'owner'],
    children: [
      {
        name: 'Dashboard',
        href: '/admin',
      },
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        name: 'System Logs',
        href: '/admin/system-logs',
        icon: FileCog,
      },
      {
        name: 'AI Decisions',
        href: '/admin/ai-decisions',
        icon: Brain,
      },
      {
        name: 'Plugin Logs',
        href: '/admin/plugin-logs',
        icon: AlertTriangle,
      },
      {
        name: 'API Keys',
        href: '/admin/api-keys',
        icon: KeyRound,
      },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: UserCircle,
  },
];
