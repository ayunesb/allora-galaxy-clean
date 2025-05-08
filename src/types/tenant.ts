import { UserRole } from "./shared";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  role?: UserRole; // Add this for easier access in components
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

// Workspace context type definition moved to contexts/workspace/types.ts
