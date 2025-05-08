
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type SystemEventModule = 'strategy' | 'plugin' | 'agent' | 'auth' | 'system' | 'security' | 'kpi';

export type SystemEventType = 'info' | 'warning' | 'error' | 'success' | 'kpi_updated' | 'kpi_update_failed' | 'onboarding_completed';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresRole?: UserRole[];
  isActive?: (pathname: string) => boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
}
