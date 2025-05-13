
-- Create table for API keys if it doesn't exist
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  scope TEXT[] DEFAULT ARRAY['read']::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index for faster lookups by key
CREATE INDEX IF NOT EXISTS api_keys_key_idx ON public.api_keys(key);

-- Add index for tenant lookups
CREATE INDEX IF NOT EXISTS api_keys_tenant_id_idx ON public.api_keys(tenant_id);

-- Add index for key prefix lookups (for displaying in UI)
CREATE INDEX IF NOT EXISTS api_keys_key_prefix_idx ON public.api_keys(key_prefix);

-- Add Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their tenant's API keys
CREATE POLICY "Users can view their tenant's API keys" ON public.api_keys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
    )
  );

-- Policy: Only admins and owners can insert API keys
CREATE POLICY "Only admins and owners can insert API keys" ON public.api_keys
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
CREATE POLICY "Only admins and owners can update API keys" ON public.api_keys
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
CREATE POLICY "Only admins and owners can delete API keys" ON public.api_keys
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles
      WHERE tenant_user_roles.tenant_id = api_keys.tenant_id
      AND tenant_user_roles.user_id = auth.uid()
      AND tenant_user_roles.role IN ('admin', 'owner')
    )
  );

-- Function to create API keys
CREATE OR REPLACE FUNCTION public.create_api_key(
  p_name TEXT,
  p_tenant_id UUID,
  p_scope TEXT[] DEFAULT ARRAY['read']::TEXT[],
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_key TEXT;
  v_key_prefix TEXT;
  v_id UUID;
  v_result JSON;
BEGIN
  -- Generate a random API key
  v_key := encode(gen_random_bytes(32), 'hex');
  
  -- Extract the first 8 characters as a prefix for display
  v_key_prefix := substring(v_key from 1 for 8);
  
  -- Insert the new API key
  INSERT INTO public.api_keys (
    name,
    key,
    key_prefix,
    tenant_id,
    created_by,
    scope,
    expires_at
  ) VALUES (
    p_name,
    v_key,
    v_key_prefix,
    p_tenant_id,
    auth.uid(),
    p_scope,
    p_expires_at
  ) RETURNING id INTO v_id;
  
  -- Return the API key details
  v_result := json_build_object(
    'id', v_id,
    'key', v_key,
    'key_prefix', v_key_prefix,
    'name', p_name,
    'scope', p_scope
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update last_used_at when the key is used
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
