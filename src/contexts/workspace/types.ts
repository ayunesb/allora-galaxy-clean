
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
  tenant: Tenant | null;
  currentTenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  isLoading: boolean;
  navigationItems: NavigationItem[];
  currentRole: UserRole | null;
  userRole: UserRole | null; // Make sure this is explicitly included
  refreshTenant: () => Promise<void>;
  error: string | null;
}
