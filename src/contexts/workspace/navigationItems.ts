
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
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Launch',
    href: '/launch',
    icon: Rocket,
  },
  {
    title: 'Galaxy',
    href: '/galaxy',
    icon: Globe,
  },
  {
    title: 'Plugins',
    href: '/plugins',
    icon: Puzzle,
  },
  {
    title: 'Agents',
    href: '/agents/performance',
    icon: UserCog,
  },
  {
    title: 'Evolution',
    href: '/evolution',
    icon: Brain,
  },
  {
    title: 'Insights',
    href: '/insights/kpis',
    icon: BarChart3,
  },
  {
    title: 'Allora Brain',
    href: '/allora-brain',
    icon: Brain,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Settings,
    requiresRole: ['admin', 'owner'],
    children: [
      {
        title: 'Dashboard',
        href: '/admin',
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'System Logs',
        href: '/admin/system-logs',
        icon: FileCog,
      },
      {
        title: 'AI Decisions',
        href: '/admin/ai-decisions',
        icon: Brain,
      },
      {
        title: 'Plugin Logs',
        href: '/admin/plugin-logs',
        icon: AlertTriangle,
      },
      {
        title: 'API Keys',
        href: '/admin/api-keys',
        icon: KeyRound,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: UserCircle,
  },
];
