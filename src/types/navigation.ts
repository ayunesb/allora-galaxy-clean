
import { ReactNode } from 'react';

/**
 * Navigation item representation
 */
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
}
