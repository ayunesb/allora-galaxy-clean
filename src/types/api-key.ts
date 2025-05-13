
export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  status: 'active' | 'revoked';
  created_at: string;
  expires_at?: string | null;
  tenant_id: string;
  last_used_at?: string | null;
  metadata?: Record<string, any>;
  scope?: string[];
}

export interface ApiKeyResponse {
  key: ApiKey;
  fullKey?: string; // Only provided once when created
}

export interface ApiKeyCreateParams {
  name: string;
  scope: string[];
  expires_at?: string | null;
}

export interface CreateApiKeyInput {
  name: string;
  scope: string[];
  expires_at?: string | null;
}
