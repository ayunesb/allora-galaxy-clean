
import { Tenant } from '@/types/tenant';
import { UserRole } from '@/types/shared';

export interface TenantWithRole extends Tenant {
  role: UserRole;
}

export interface WorkspaceContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  userRole: UserRole | null;
  tenantsList: TenantWithRole[];
  loading: boolean;
  error: Error | null;
  isLoading: boolean; // Add this property
  setTenantId: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  refreshTenant: () => void;
  navigationItems?: any[]; // Add this property
}
