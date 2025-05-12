
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: LucideIcon | string;
  items?: NavigationItem[];
  adminOnly?: boolean;
}

export interface NavigationConfig {
  mainNavItems: NavigationItem[];
  adminNavItems: NavigationItem[];
}
