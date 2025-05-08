
import { UserRole } from '@/types/shared';
import { Tenant } from '@/types/tenant';

export interface TenantWithRole extends Tenant {
  role: UserRole;
}

export interface WorkspaceContextType {
  currentTenant: TenantWithRole | null;
  tenants: TenantWithRole[];
  setCurrentTenant: (tenant: TenantWithRole | null) => void;
  isLoading: boolean;
  userRole?: UserRole;
}
