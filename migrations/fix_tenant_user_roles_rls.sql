
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
