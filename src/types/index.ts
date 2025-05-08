
// Central type exports file
// This file re-exports all types from the type system for easier imports

// Re-export types from their respective domains
export * from './plugin';
export * from './strategy';
export * from './agent';
export * from './execution';
export * from './tenant';
export * from './shared';
export * from './galaxy';
export * from './notifications';

// Deprecated types - these should eventually be migrated to the domain-specific files
export * from './fixed';

// Define Strategy type to avoid import errors
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed" | "draft";
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  tenant_id?: string;
  created_by?: string;
  approved_by?: string;
  completion_percentage?: number;
  due_date?: string;
  priority?: string;
}

// Add the KPI interface if it doesn't already exist
export interface KPI {
  id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  unit: string;
  target?: number | null;
  category: string;
  period: string;
  source?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  metadata?: Record<string, any>;
  date: string;
}

// Define PluginLog interface needed for StrategyBuilder.tsx
export interface PluginLog {
  id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  tenant_id?: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  created_at?: string;
  execution_time?: number;
  xp_earned?: number;
}
