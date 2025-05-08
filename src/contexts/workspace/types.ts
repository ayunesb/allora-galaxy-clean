
import { Tenant, UserRole } from '@/types/tenant';

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
  setTenantId: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  refreshTenant: () => void;
}
