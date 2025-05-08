
-- Create API keys table for Allora-as-a-Brain
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_by UUID REFERENCES auth.users(id)
);

-- Add Row Level Security (RLS) to API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy for selecting API keys: Users can view API keys for tenants they are admins of
CREATE POLICY api_keys_select_policy ON api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('owner', 'admin')
    )
  );

-- Policy for inserting API keys: Users can create API keys for tenants they are admins of
CREATE POLICY api_keys_insert_policy ON api_keys
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('owner', 'admin')
    )
  );

-- Policy for updating API keys: Users can update API keys for tenants they are admins of
CREATE POLICY api_keys_update_policy ON api_keys
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('owner', 'admin')
    )
  );

-- Policy for deleting API keys: Users can delete API keys for tenants they are admins of
CREATE POLICY api_keys_delete_policy ON api_keys
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('owner', 'admin')
    )
  );

-- Function to update last_used_at when API key is used
CREATE OR REPLACE FUNCTION update_api_key_last_used() RETURNS TRIGGER AS $$
BEGIN
  UPDATE api_keys
  SET last_used_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last_used timestamp
CREATE TRIGGER update_api_key_last_used_trigger
  AFTER UPDATE OF last_used_at ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_last_used();
