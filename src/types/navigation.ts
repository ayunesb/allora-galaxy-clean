
// Navigation-related types
export interface NavigationItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
}
