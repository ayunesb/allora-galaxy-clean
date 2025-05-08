
import { LucideIcon } from 'lucide-react';
import {
  BarChart4,
  Layers,
  Rocket,
  Settings,
  Users,
  Zap,
  Database,
  Plug,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
  adminOnly?: boolean;
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart4,
  },
  {
    title: 'Galaxy',
    href: '/galaxy',
    icon: Zap,
  },
  {
    title: 'Launch',
    href: '/launch',
    icon: Rocket,
  },
  {
    title: 'Plugins',
    href: '/plugins',
    icon: Plug,
  },
  {
    title: 'KPIs',
    href: '/insights/kpis',
    icon: Database,
  },
];

export const adminNavItems: NavItem[] = [
  {
    title: 'Admin',
    href: '/admin',
    icon: Settings,
    children: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'AI Decisions',
        href: '/admin/ai-decisions',
        icon: Layers,
      },
    ],
    adminOnly: true,
  },
];
