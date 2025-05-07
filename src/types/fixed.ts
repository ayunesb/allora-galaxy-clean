
import { Json } from "@/integrations/supabase/types";

// Define common types for the application

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role?: UserRole;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  metadata?: Record<string, any>;
}

// Strategy Types
export interface Strategy {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: StrategyStatus;
  createdBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: StrategyPriority;
  tags?: string[];
  completionPercentage: number;
  createdByAi?: boolean;
}

export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
export type StrategyPriority = 'low' | 'medium' | 'high';

// Plugin Types
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: PluginStatus;
  xp: number;
  roi: number;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  category?: string;
  metadata?: Record<string, any>;
  tenantId?: string; // Adding tenant_id as this seems to be referenced in migrations
}

export type PluginStatus = 'active' | 'inactive' | 'deprecated';

// Agent Version Types
export interface AgentVersion {
  id: string;
  pluginId: string;
  version: string;
  prompt: string;
  status: AgentStatus;
  xp: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  upvotes: number;
  downvotes: number;
  tenantId?: string; // Adding tenant_id as this seems to be referenced in migrations
}

export type AgentStatus = 'active' | 'deprecated';

// Agent Vote Types
export interface AgentVote {
  id: string;
  agentVersionId: string;
  userId: string;
  voteType: VoteType;
  comment?: string;
  createdAt: string;
}

export type VoteType = 'up' | 'down';

// Plugin Log Types
export interface PluginLog {
  id: string;
  pluginId?: string;
  strategyId?: string;
  tenantId: string;
  agentVersionId?: string;
  status: LogStatus;
  input?: any;
  output?: any;
  error?: string;
  createdAt: string;
  executionTime: number;
  xpEarned: number;
}

export type LogStatus = 'success' | 'failure' | 'pending';

// KPI Types
export interface KPI {
  id: string;
  tenantId: string;
  name: string;
  value: number;
  previousValue?: number;
  source?: KPISource;
  category?: KPICategory;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type KPISource = 'stripe' | 'ga4' | 'hubspot' | 'manual';
export type KPICategory = 'financial' | 'marketing' | 'sales' | 'product';

// Execution Types
export interface Execution {
  id: string;
  agentVersionId?: string;
  createdAt: string;
  error?: string;
  executedBy?: string;
  executionTime?: number;
  input?: any;
  output?: any;
  pluginId?: string;
  status: LogStatus;
  strategyId?: string;
  tenantId: string;
  type: string;
  xpEarned?: number;
}

// System Log Types
export interface SystemLog {
  id: string;
  event: string;
  context?: any;
  createdAt: string;
  module: string;
  tenantId?: string;
}

// Company Profile Types
export interface CompanyProfile {
  id: string;
  tenantId: string;
  name: string;
  industry?: string;
  size?: CompanySize;
  revenueRange?: string;
  website?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanySize = 'solo' | 'small' | 'medium' | 'large' | 'enterprise';

// Persona Profile Types
export interface PersonaProfile {
  id: string;
  tenantId: string;
  name: string;
  tone?: string;
  goals?: string[];
  createdAt: string;
  updatedAt: string;
}

// Execute Strategy Types
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, unknown>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  error?: string;
  executionTime?: number;
  outputs?: Record<string, any>;
  logs?: PluginLog[];
}

// Plugin Execution Types
export interface PluginResult {
  pluginId: string;
  status: LogStatus;
  output?: any;
  error?: string;
  executionTime?: number;
  xpEarned: number;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  error?: string;
}

// Execution Record Types
export interface ExecutionRecordInput {
  pluginId?: string;
  strategyId?: string;
  tenantId: string;
  agentVersionId?: string;
  status: LogStatus;
  input?: any;
  output?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
  executedBy?: string;
  type: string;
}

// Helper functions for converting between camelCase and snake_case
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      result[snakeKey] = obj[key];
    }
  }
  
  return result;
}

export function snakeToCamel<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  
  return result as T;
}
