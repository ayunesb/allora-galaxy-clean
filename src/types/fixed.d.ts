
/**
 * Core types for the Allora OS application
 */

// ExecuteStrategy types
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  error?: string;
  executionId?: string;
  executionTime?: number;
  pluginsExecuted?: number;
  successfulPlugins?: number;
  xpEarned?: number;
}

// KPI types
export interface KpiData {
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number | null;
  source: "stripe" | "ga4" | "hubspot" | "manual";
  category: "financial" | "marketing" | "sales" | "product";
  date: string;
}
