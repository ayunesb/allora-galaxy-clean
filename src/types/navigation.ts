
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id?: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  items?: NavigationItem[];
  adminOnly?: boolean;
  badge?: string | number;
  isNew?: boolean;
  isExternal?: boolean;
}

export interface NavigationConfig {
  mainNavItems: NavigationItem[];
  adminNavItems: NavigationItem[];
}
