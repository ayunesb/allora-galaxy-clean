
import {
  LayoutDashboard,
  Rocket,
  Zap,
  LineChart,
  Settings,
  Terminal,
  Brain,
  Activity,
} from 'lucide-react';
import { NavigationItem } from '@/types/shared';

export const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Launch',
    href: '/launch',
    icon: Rocket
  },
  {
    name: 'Galaxy',
    href: '/galaxy',
    icon: Activity
  },
  {
    name: 'Plugins',
    href: '/plugins',
    icon: Zap
  },
  {
    name: 'Agent Performance',
    href: '/agents/performance',
    icon: Terminal
  },
  {
    name: 'Evolution',
    href: '/evolution',
    icon: Brain
  },
  {
    name: 'KPI Insights',
    href: '/insights/kpis',
    icon: LineChart
  },
  {
    name: 'Administration',
    href: '/admin',
    icon: Settings,
    requiresRole: ['admin', 'owner']
  },
  {
    name: 'Allora Brain',
    href: '/allora-brain',
    icon: Brain
  }
];
