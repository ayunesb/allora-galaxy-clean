
import { UserRole } from './shared';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface TenantWithRole extends Tenant {
  role: UserRole;
}

export interface TenantUser {
  user_id: string;
  tenant_id: string;
  role: UserRole;
  created_at?: string;
}

export interface CompanyProfile {
  id: string;
  tenant_id: string;
  name: string;
  industry?: string;
  size?: string;
  revenue_range?: string;
  website?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PersonaProfile {
  id: string;
  tenant_id: string;
  name: string;
  goals?: string[];
  tone?: string;
  created_at?: string;
  updated_at?: string;
}
