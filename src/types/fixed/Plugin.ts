
export interface Plugin {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  category: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  tenant_id?: string;
}
