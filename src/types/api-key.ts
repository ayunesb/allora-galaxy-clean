
export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  tenant_id: string;
  created_by: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  status: 'active' | 'revoked';
  scope: string[];
}

export interface ApiKeyCreateParams {
  name: string;
  scope: string[];
  expires_at?: string | null;
}

export interface ApiKeyResponse {
  id: string;
  key: string;
  key_prefix: string;
  name: string;
  scope: string[];
}
