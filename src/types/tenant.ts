
// Tenant related types
import { UserRole } from './user';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  metadata?: Record<string, any>;
  description?: string; // Add optional description field
}

// Add tenant features for future extensibility
export interface TenantFeature {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface TenantWithRole extends Tenant {
  role: UserRole;
}
