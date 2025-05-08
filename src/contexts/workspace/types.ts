
import { Tenant } from '@/types/tenant';

export interface TenantWithRole extends Tenant {
  role: string;
}

export interface WorkspaceContextType {
  currentTenant: TenantWithRole | null;
  tenants: TenantWithRole[];
  setCurrentTenant: (tenant: TenantWithRole | null) => void;
  isLoading: boolean;
}
