
import { UserRole } from "./shared";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface TenantUserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
}

export interface TenantWithRole extends Tenant {
  role: UserRole;
}

// Workspace context type definition
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
