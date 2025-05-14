
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
