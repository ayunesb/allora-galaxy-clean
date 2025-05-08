
export interface Webhook {
  id: string;
  url: string;
  event_types: string[];
  is_active: boolean;
  secret?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  description?: string;
}
