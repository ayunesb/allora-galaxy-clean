
import { NavigationItem } from '@/types/shared';
import {
  Home,
  RocketIcon,
  GlobeIcon,
  BadgePercentIcon,
  PuzzleIcon,
  Users,
  LineChart,
  Brain,
  Server
} from 'lucide-react';

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Launch',
    href: '/launch',
    icon: RocketIcon,
  },
  {
    title: 'Galaxy',
    href: '/galaxy',
    icon: GlobeIcon,
  },
  {
    title: 'Plugins',
    href: '/plugins',
    icon: PuzzleIcon,
  },
  {
    title: 'Agents',
    href: '/agents/performance',
    icon: Users,
  },
  {
    title: 'Insights',
    href: '/insights/kpis',
    icon: LineChart,
  },
  {
    title: 'Evolution',
    href: '/evolution',
    icon: LineChart,
  },
  {
    title: 'Allora Brain',
    href: '/allora-brain',
    icon: Brain,
    requiresRole: ['admin', 'owner']
  },
  {
    title: 'Standalone Agent',
    href: '/standalone',
    icon: Server,
    requiresRole: ['admin', 'owner']
  },
];
