
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
export * from './functions';

// Define Strategy type to avoid import errors
export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
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
