
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/lib/auth/roleTypes';

export interface Tenant {
  id: string;
  name: string;
  settings?: Record<string, any>;
  role?: UserRole;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface WorkspaceContextType {
  tenant: Tenant | null;
  currentTenant: Tenant | null; // Alias for compatibility
  setTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  navigationItems: NavigationItem[];
  currentRole: UserRole | null;
  refreshTenant: () => Promise<void>;
  error: string | null;
}
