
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
  items?: NavigationItem[];
  disabled?: boolean;
}
