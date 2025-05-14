
// Re-export from domain-specific files
export * from './agent';
export * from './plugin';
export * from './strategy';
export * from './shared';
export * from './kpi';
export * from './tenant';
export * from './user';
export * from './voting';

// Define the Strategy type here for components that need it
export interface Strategy {
  id: string;
  tenant_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'archived';
  priority?: 'high' | 'medium' | 'low';
  completion_percentage?: number;
  created_by?: string | { id: string; name: string; };
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// Export the PluginLog type for components that need it
export interface PluginLog {
  id: string;
  plugin_id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
  execution_id?: string;
}

// Also define the WorkspaceContextType here
export type { WorkspaceContextType } from '@/context/workspace-context';
