
export * from './Plugin';
export * from './AgentTypes';
export * from './Webhook';
export * from './Strategy';
export * from './TaskTypes';
export * from './ExecuteStrategy';

export type RunPluginChainResult = { output: string; status: string };

// Type definitions that don't belong in specific files
export type LogStatus = 'pending' | 'success' | 'failure' | 'partial';
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  metadata?: Record<string, any>;
  role?: UserRole;
}
