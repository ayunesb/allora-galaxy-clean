
import { BaseEntity } from './shared';

export interface Plugin extends BaseEntity {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  tenant_id?: string;
  status: string;
  xp?: number;
  roi?: number;
  metadata?: Record<string, any>;
}

export interface PluginResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

export interface RunPluginChainInput {
  plugins: Plugin[];
  agentVersions: any[];
  initialInput: any;
  strategy?: any;
  params: {
    tenant_id: string;
    user_id?: string;
    dryRun?: boolean;
  };
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  output: any;
}
