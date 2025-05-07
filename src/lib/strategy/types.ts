
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: {
    send_notifications?: boolean;
    record_analytics?: boolean;
    run_mode?: 'manual' | 'scheduled' | 'automated';
  };
}

export interface ExecuteStrategyResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  execution_time?: number;
  execution_id?: string | null;
  plugins_executed?: number;
  plugins_succeeded?: number;
  plugins_failed?: number;
  completion_percentage?: number;
  errors?: Array<{plugin_name?: string, error: string}>;
}

export interface PluginExecutionResult {
  plugin_id: string;
  name?: string;
  status: 'success' | 'failure' | 'pending' | 'skipped';
  execution_time?: number;
  error?: string;
  output?: Record<string, any>;
  xp_earned?: number;
}

export interface StrategyMetrics {
  total_executions: number;
  successful_executions: number;
  average_execution_time: number;
  success_rate: number;
  last_executed_at: string | null;
}

export interface KpiDataInput {
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  source: 'stripe' | 'ga4' | 'hubspot' | 'manual';
  category: 'financial' | 'marketing' | 'sales' | 'product';
  date?: string;
}

export interface MilestoneAlert {
  tenant_id: string;
  user_id?: string;
  title: string;
  message: string;
  achievement_type: 'kpi' | 'strategy' | 'plugin' | 'agent' | 'user';
  achievement_id?: string;
  importance: 'low' | 'medium' | 'high';
  icon?: string;
  action_url?: string;
}

export interface UserInviteData {
  email: string;
  tenant_id: string;
  tenant_name: string;
  role?: string;
  custom_message?: string;
}

export interface HubspotMqlData {
  tenant_id: string;
  hubspot_api_key?: string;
  date?: string;
}
