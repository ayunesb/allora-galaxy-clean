
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/lib/auth/roleTypes';

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
  role?: UserRole;
}

export interface WorkspaceContextType {
  navigationItems: NavigationItem[];
  currentTenant: Tenant | null;
  tenants: Tenant[];
  currentUrl: string;
  isLoading: boolean;
  currentRole?: UserRole;
  loading?: boolean;
  tenant?: Tenant | null;
  userRole?: UserRole;
  setCurrentUrl: (url: string) => void;
  switchTenant: (tenantId: string) => Promise<boolean>;
}

export interface WorkspaceData {
  navigationItems: NavigationItem[];
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
}
