
import { DateRange } from 'react-day-picker';

// Navigation
export interface NavigationItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

// Tenants and Users
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  metadata?: Record<string, any>;
}

export interface UserRole {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  onboarding_completed?: boolean;
}

// Business Objects
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  created_by?: User;
  approved_by?: User;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  completion_percentage?: number;
  tenant_id: string;
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
  tenant_id: string;
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
  created_by?: User;
  upvotes: number;
  downvotes: number;
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  strategy_id?: string;
  agent_version_id?: string;
  tenant_id: string;
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

// Voting Types
export type VoteType = 'upvote' | 'downvote';

export interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  comment?: string;
  created_at: string;
}

// System and Audit Logs
export interface SystemLog {
  id: string;
  module: string;
  event: string;
  context?: Record<string, any>;
  created_at: string;
  tenant_id?: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  event_type: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  module?: string;
  tenant_id?: string;
}

// Executions
export interface Execution {
  id: string;
  tenant_id: string;
  type: string;
  status: 'success' | 'failure' | 'pending';
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  created_at: string;
  execution_time: number;
  xp_earned: number;
}

// Evolution types
export interface EvolutionFilter {
  dateRange?: DateRange;
  type?: string;
  status?: string;
  searchTerm?: string;
}

// Trend direction for KPIs
export type TrendDirection = 'up' | 'down' | 'neutral' | 'increasing' | 'decreasing' | 'stable';

// KPI trend data
export interface KPITrend {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  percentChange: number;
  direction: TrendDirection;
  target?: number;
  date: string;
  category?: string;
}

// Onboarding step type
export type OnboardingStep = 'welcome' | 'company-info' | 'persona' | 'additional-info' | 'strategy-generation' | 'completed';

// Log status type
export type LogStatus = 'success' | 'error' | 'warning' | 'info';
