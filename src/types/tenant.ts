
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any> | null;
  userRole?: string | null;
}

export interface TenantUserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface CreateTenantInput {
  name: string;
  slug?: string;
}

export interface TenantStats {
  userCount: number;
  strategyCount: number;
  pluginCount: number;
  executionCount: number;
}
