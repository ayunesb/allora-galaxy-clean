
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface CreateTenantInput {
  name: string;
  slug?: string;
  metadata?: Record<string, any>;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
}
