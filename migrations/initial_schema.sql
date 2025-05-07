
-- Enable the extensions we need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the app_role enum type
CREATE TYPE app_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Security definer functions for RLS
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

-- Create essential tables
-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB
);

-- Tenant User Roles Table
CREATE TABLE IF NOT EXISTS tenant_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "tenant_select" ON tenants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles WHERE tenant_id = id
    )
  );

CREATE POLICY "tenant_insert" ON tenants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "tenant_update" ON tenants
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = id AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tenant_user_roles using security definer functions
CREATE POLICY "tenant_user_roles_select" ON tenant_user_roles
  FOR SELECT 
  USING (
    is_tenant_member(tenant_id)
  );

CREATE POLICY "tenant_user_roles_insert" ON tenant_user_roles
  FOR INSERT 
  WITH CHECK (
    is_tenant_admin(tenant_id)
  );

CREATE POLICY "tenant_user_roles_update" ON tenant_user_roles
  FOR UPDATE 
  USING (
    is_tenant_admin(tenant_id)
  );

CREATE POLICY "tenant_user_roles_delete" ON tenant_user_roles
  FOR DELETE 
  USING (
    is_tenant_admin(tenant_id)
  );

-- Add a special policy for owners to manage their own tenant
CREATE POLICY "tenant_owner_full_access" ON tenant_user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = tenant_id
      AND tenants.owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_user_roles_tenant_id ON tenant_user_roles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_user_roles_user_id ON tenant_user_roles (user_id);
