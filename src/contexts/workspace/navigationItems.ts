
import {
  LayoutDashboard,
  Rocket,
  Galaxy,
  Zap,
  LineChart,
  Settings,
  Users,
  Terminal,
  Brain,
} from 'lucide-react';
import { NavigationItem } from '@/types/shared';

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Launch',
    href: '/launch',
    icon: Rocket
  },
  {
    title: 'Galaxy',
    href: '/galaxy',
    icon: Galaxy
  },
  {
    title: 'Plugins',
    href: '/plugins',
    icon: Zap
  },
  {
    title: 'Agent Performance',
    href: '/agents/performance',
    icon: Terminal
  },
  {
    title: 'Evolution',
    href: '/evolution',
    icon: Brain
  },
  {
    title: 'KPI Insights',
    href: '/insights/kpis',
    icon: LineChart
  },
  {
    title: 'Administration',
    href: '/admin',
    icon: Settings,
    requiresRole: ['admin', 'owner']
  },
  {
    title: 'Allora Brain',
    href: '/allora-brain',
    icon: Brain
  }
];
