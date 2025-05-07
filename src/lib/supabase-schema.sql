
-- Tenants Table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB
);

-- Tenant User Roles Table
CREATE TABLE tenant_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Company Profiles Table
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT CHECK (size IN ('solo', 'small', 'medium', 'large', 'enterprise')),
  revenue_range TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persona Profiles Table
CREATE TABLE persona_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tone TEXT,
  goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategies Table
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[],
  completion_percentage INTEGER DEFAULT 0
);

-- Plugins Table
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'deprecated')),
  xp INTEGER DEFAULT 0,
  roi INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  icon TEXT,
  category TEXT,
  metadata JSONB
);

-- Agent Versions Table
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'deprecated')),
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- Plugin Logs Table
CREATE TABLE plugin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID REFERENCES plugins(id) ON DELETE SET NULL,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_version_id UUID REFERENCES agent_versions(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
  input JSONB,
  output JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  execution_time FLOAT DEFAULT 0,
  xp_earned INTEGER DEFAULT 0
);

-- KPIs Table
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value FLOAT NOT NULL,
  previous_value FLOAT,
  source TEXT CHECK (source IN ('stripe', 'ga4', 'hubspot', 'manual')),
  category TEXT CHECK (category IN ('financial', 'marketing', 'sales', 'product')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Votes Table
CREATE TABLE agent_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES agent_versions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY tenant_select ON tenants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles WHERE tenant_id = id
    )
  );

CREATE POLICY tenant_insert ON tenants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY tenant_update ON tenants
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = id AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for tenant_user_roles
CREATE POLICY tenant_user_roles_select ON tenant_user_roles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id
    )
  );

CREATE POLICY tenant_user_roles_insert ON tenant_user_roles
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for company_profiles
CREATE POLICY company_profiles_select ON company_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id
    )
  );

-- RLS Policies for persona_profiles
CREATE POLICY persona_profiles_select ON persona_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id
    )
  );

-- RLS Policies for strategies
CREATE POLICY strategies_select ON strategies
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM tenant_user_roles 
      WHERE tenant_id = tenant_id
    )
  );

-- Similar RLS policies can be defined for other tables
-- Implement edge functions as needed for the application
