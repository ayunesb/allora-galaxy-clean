
// Core types for the application

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  metadata?: Record<string, any>;
}

export interface TenantUserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  tenant_id: string;
  name: string;
  industry?: string;
  size?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  revenue_range?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonaProfile {
  id: string;
  tenant_id: string;
  name: string;
  tone?: string;
  goals?: string[];
  created_at: string;
  updated_at: string;
}

export interface Strategy {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  completion_percentage: number;
}

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'deprecated';
  xp: number;
  roi: number;
  created_at: string;
  updated_at: string;
  icon?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface AgentVersion {
  id: string;
  plugin_id: string;
  version: string;
  prompt: string;
  status: 'active' | 'deprecated';
  xp: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  upvotes: number;
  downvotes: number;
}

export interface PluginLog {
  id: string;
  plugin_id?: string;
  strategy_id?: string;
  tenant_id: string;
  agent_version_id?: string;
  status: 'success' | 'failure' | 'pending';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  created_at: string;
  execution_time: number;
  xp_earned: number;
}

export interface KPI {
  id: string;
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number;
  source?: 'stripe' | 'ga4' | 'hubspot' | 'manual';
  category?: 'financial' | 'marketing' | 'sales' | 'product';
  date: string;
  created_at: string;
  updated_at: string;
}

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  comment?: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  tenant_id: string;
  module: 'strategy' | 'plugin' | 'agent' | 'auth' | 'billing';
  event: string;
  context?: Record<string, any>;
  created_at: string;
}

export interface Execution {
  id: string;
  tenant_id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  type: 'plugin' | 'agent' | 'strategy';
  status: 'success' | 'failure' | 'pending';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  trial_ends_at?: string;
  renews_at?: string;
  created_at: string;
}
