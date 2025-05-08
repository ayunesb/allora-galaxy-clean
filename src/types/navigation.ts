
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Navigation item definition
 */
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
}

/**
 * Navigation group
 */
export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

/**
 * Sidebar navigation item
 */
export interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: SidebarItem[];
  disabled?: boolean;
}
