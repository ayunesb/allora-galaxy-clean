
-- Drop the existing RLS policies on tenant_user_roles that could be causing the recursion
DROP POLICY IF EXISTS "tenant_user_roles_select" ON public.tenant_user_roles;
DROP POLICY IF EXISTS "tenant_user_roles_insert" ON public.tenant_user_roles;
DROP POLICY IF EXISTS "tenant_user_roles_update" ON public.tenant_user_roles;
DROP POLICY IF EXISTS "tenant_user_roles_delete" ON public.tenant_user_roles;

-- Create a security definer function to check if a user is a tenant member
-- This function will be run with the permissions of the function owner, 
-- bypassing RLS checks and thus avoiding recursion
CREATE OR REPLACE FUNCTION public.is_tenant_member(tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_user_roles 
    WHERE tenant_user_roles.tenant_id = $1 
    AND user_id = auth.uid()
  );
END;
$$;

-- Create a security definer function to check if a user is a tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_user_roles 
    WHERE tenant_user_roles.tenant_id = $1 
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  );
END;
$$;

-- Re-create the RLS policies for tenant_user_roles using the security definer functions
-- Users can see roles for tenants they are members of
CREATE POLICY "tenant_user_roles_select" ON tenant_user_roles
  FOR SELECT 
  USING (
    is_tenant_member(tenant_id)
  );

-- Only admins and owners can insert new user roles to their tenant
CREATE POLICY "tenant_user_roles_insert" ON tenant_user_roles
  FOR INSERT 
  WITH CHECK (
    is_tenant_admin(tenant_id)
  );

-- Only admins and owners can update user roles in their tenant
CREATE POLICY "tenant_user_roles_update" ON tenant_user_roles
  FOR UPDATE 
  USING (
    is_tenant_admin(tenant_id)
  );

-- Only admins and owners can delete user roles from their tenant
CREATE POLICY "tenant_user_roles_delete" ON tenant_user_roles
  FOR DELETE 
  USING (
    is_tenant_admin(tenant_id)
  );

-- Fix common RLS policy issues for other tables
-- Add missing DELETE and UPDATE policies for strategies
DROP POLICY IF EXISTS "strategies_delete" ON public.strategies;
DROP POLICY IF EXISTS "strategies_update" ON public.strategies;

CREATE POLICY "strategies_delete" ON public.strategies
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = strategies.tenant_id AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "strategies_update" ON public.strategies
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = strategies.tenant_id AND role IN ('owner', 'admin')
    )
  );

-- Add missing DELETE and UPDATE policies for plugins
DROP POLICY IF EXISTS "plugins_delete" ON public.plugins;
DROP POLICY IF EXISTS "plugins_update" ON public.plugins;

CREATE POLICY "plugins_delete" ON public.plugins
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "plugins_update" ON public.plugins
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id AND role IN ('owner', 'admin')
    )
  );

-- Add missing DELETE and UPDATE policies for agent_versions
DROP POLICY IF EXISTS "agent_versions_delete" ON public.agent_versions;
DROP POLICY IF EXISTS "agent_versions_update" ON public.agent_versions;

CREATE POLICY "agent_versions_delete" ON public.agent_versions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_user_roles.tenant_id = tenant_id AND role IN ('owner', 'admin')
    )
    OR auth.uid() = created_by
  );

CREATE POLICY "agent_versions_update" ON public.agent_versions
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_user_roles.tenant_id = tenant_id AND role IN ('owner', 'admin')
    )
    OR auth.uid() = created_by
  );

-- Add missing DELETE and UPDATE policies for kpis
DROP POLICY IF EXISTS "kpis_delete" ON public.kpis;
DROP POLICY IF EXISTS "kpis_update" ON public.kpis;

CREATE POLICY "kpis_delete" ON public.kpis
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_user_roles.tenant_id = kpis.tenant_id AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "kpis_update" ON public.kpis
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_user_roles.tenant_id = kpis.tenant_id AND role IN ('owner', 'admin')
    )
  );
