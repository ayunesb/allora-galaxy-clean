export interface ApiKey {
  id: string;
  name: string;
  key: string;
  tenant_id: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  status: "active" | "revoked";
}

export interface ApiKeyCreateParams {
  name: string;
  tenant_id: string;
  expires_at?: string;
}
