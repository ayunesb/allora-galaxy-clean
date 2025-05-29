import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  name?: string; // For backward compatibility
  title: string; // Primary field for display
  href: string;
  icon?: LucideIcon | string;
  items?: NavigationItem[];
  adminOnly?: boolean;
}

export interface NavigationConfig {
  mainNavItems: NavigationItem[];
  adminNavItems: NavigationItem[];
}
