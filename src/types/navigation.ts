
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Standard navigation item interface to be used across the application
 */
export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  role?: string;
}
