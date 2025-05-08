
-- Create table for API keys if it doesn't exist
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index for faster lookups by key
CREATE INDEX IF NOT EXISTS api_keys_key_idx ON public.api_keys(key);

-- Add index for tenant lookups
CREATE INDEX IF NOT EXISTS api_keys_tenant_id_idx ON public.api_keys(tenant_id);

-- Add Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their tenant's API keys
CREATE POLICY api_keys_select ON public.api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
    )
  );

-- Policy: Only admins and owners can insert API keys
CREATE POLICY api_keys_insert ON public.api_keys
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('admin', 'owner')
    )
  );

-- Policy: Only admins and owners can update API keys
CREATE POLICY api_keys_update ON public.api_keys
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('admin', 'owner')
    )
  );

-- Policy: Only admins and owners can delete API keys
CREATE POLICY api_keys_delete ON public.api_keys
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('admin', 'owner')
    )
  );

-- Add function to update last_used_at when the key is used
CREATE OR REPLACE FUNCTION public.update_api_key_last_used()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.last_used_at IS DISTINCT FROM NEW.last_used_at THEN
    RETURN NEW;
  END IF;
  
  NEW.last_used_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to call the function when the key is updated
DROP TRIGGER IF EXISTS update_api_key_last_used_trigger ON public.api_keys;
CREATE TRIGGER update_api_key_last_used_trigger
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_api_key_last_used();
