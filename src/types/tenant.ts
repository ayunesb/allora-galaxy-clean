
import { UserRole } from "./shared";

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
  role?: UserRole; // Added for convenience when joining with tenant_user_roles
}

export interface CompanyProfile {
  id: string;
  tenant_id: string;
  name: string;
  industry?: string;
  size?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
