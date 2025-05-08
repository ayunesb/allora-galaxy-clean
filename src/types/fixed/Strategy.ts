
export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  tenant_id: string;
}
