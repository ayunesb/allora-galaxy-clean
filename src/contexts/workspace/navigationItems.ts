
import { NavigationItem, UserRole } from '@/types/shared';
import { 
  LayoutDashboard, 
  Network, 
  Rocket, 
  PuzzlePiece, 
  BarChart, 
  ScrollText, 
  Users, 
  Settings, 
  CreditCard,
  Brain,
  GitMerge
} from 'lucide-react';

export const getNavigationItems = (): NavigationItem[] => [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Galaxy',
    href: '/galaxy',
    icon: Network
  },
  {
    name: 'Launch',
    href: '/launch',
    icon: Rocket
  },
  {
    name: 'Plugins',
    href: '/plugins',
    icon: PuzzlePiece
  },
  {
    name: 'Evolution',
    href: '/evolution',
    icon: GitMerge
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: BarChart,
    children: [
      {
        name: 'KPIs',
        href: '/insights/kpis',
        badges: [
          {
            label: 'New',
            variant: 'default'
          }
        ]
      }
    ]
  },
  {
    name: 'Agents',
    href: '/agents/performance',
    icon: Brain
  },
  {
    name: 'Strategy',
    href: '/strategy',
    icon: ScrollText
  },
  {
    name: 'Allora Brain',
    href: '/allora-brain',
    icon: Brain,
    badges: [
      {
        label: 'New',
        variant: 'default'
      }
    ]
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Users,
    roles: ['admin', 'owner'],
    children: [
      {
        name: 'System Logs',
        href: '/admin/logs'
      },
      {
        name: 'Users',
        href: '/admin/users'
      },
      {
        name: 'API Keys',
        href: '/admin/api-keys'
      }
    ]
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    roles: ['owner', 'admin']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
];
