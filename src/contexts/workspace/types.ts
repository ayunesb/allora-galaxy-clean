
import { UserRole } from "@/types/shared";

export interface TenantWithRole {
  id: string;
  name: string;
  slug?: string;
  role: UserRole;
}

export interface WorkspaceContextType {
  currentTenant: TenantWithRole | null;
  tenants: TenantWithRole[];
  setCurrentTenant: (tenant: TenantWithRole | null) => void;
  isLoading: boolean;
  userRole?: UserRole;
  tenant?: {
    id: string;
    name: string;
  } | null;
  loading?: boolean; // Added for backward compatibility
}
