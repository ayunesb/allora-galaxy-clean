
import { Json } from '../supabase';

export interface Plugin {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  xp?: number | null;
  roi?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  icon?: string | null;
  category?: string | null;
  version?: string;
  metadata?: Json | null;
  tenant_id?: string | null;
}

export interface PluginLog {
  id: string;
  plugin_id?: string | null;
  strategy_id?: string | null;
  agent_version_id?: string | null;
  tenant_id?: string | null;
  status: string;
  input?: Json | null;
  output?: Json | null;
  error?: string | null;
  created_at?: string | null;
  execution_time?: number | null;
  xp_earned?: number | null;
  event?: string;
  metadata?: Json | null;
}

export interface PluginResult {
  id: string;
  name: string;
  output: any;
  success: boolean;
  executionTime: number;
  error?: string | null;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  totalExecutionTime: number;
  error?: string | null;
}
