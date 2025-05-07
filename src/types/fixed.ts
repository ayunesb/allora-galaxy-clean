
/**
 * src/types/fixed.ts
 * 
 * This file serves as the canonical source of truth for core types across the application.
 * Exports are organized and normalized with camelCase for TypeScript usage, while preserving
 * mapping information to Supabase's snake_case when applicable.
 */

import { z } from 'zod';

// ==============================
// Enums and Constants
// ==============================

/**
 * Supported business event types for logging and analytics
 */
export enum BusinessEventType {
  STRATEGY_CREATED = 'strategy_created',
  STRATEGY_APPROVED = 'strategy_approved',
  STRATEGY_EXECUTED = 'strategy_executed',
  PLUGIN_EXECUTED = 'plugin_executed',
  AGENT_VOTED = 'agent_voted',
  KPI_UPDATED = 'kpi_updated'
}

/**
 * Agent vote types
 */
export type VoteType = 'up' | 'down';

/**
 * Strategy status options
 */
export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';

/**
 * Strategy priority levels
 */
export type StrategyPriority = 'low' | 'medium' | 'high';

/**
 * Plugin status options
 */
export type PluginStatus = 'active' | 'inactive' | 'deprecated';

/**
 * Agent version status options
 */
export type AgentVersionStatus = 'active' | 'deprecated';

/**
 * Execution status options
 */
export type ExecutionStatus = 'success' | 'failure' | 'pending' | 'partial';

/**
 * User role options
 */
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * KPI categories
 */
export type KpiCategory = 'financial' | 'marketing' | 'sales' | 'product';

/**
 * KPI data sources
 */
export type KpiSource = 'stripe' | 'ga4' | 'hubspot' | 'manual';

/**
 * System log module areas
 */
export type SystemLogModule = 'strategy' | 'plugin' | 'agent' | 'auth' | 'billing';

// ==============================
// Core Entity Types
// ==============================

/**
 * Tenant (workspace) entity
 * Maps to tenants table in Supabase
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string; // maps to created_at
  updatedAt: string; // maps to updated_at
  ownerId: string;   // maps to owner_id
  metadata?: Record<string, any>;
}

/**
 * User-Tenant relationship with role assignment
 * Maps to tenant_user_roles table in Supabase
 */
export interface TenantUserRole {
  id: string;
  tenantId: string;  // maps to tenant_id
  userId: string;    // maps to user_id
  role: UserRole;
  createdAt: string; // maps to created_at
}

/**
 * Company profile entity
 * Maps to company_profiles table in Supabase
 */
export interface CompanyProfile {
  id: string;
  tenantId: string;  // maps to tenant_id
  name: string;
  industry?: string;
  size?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  revenueRange?: string;
  website?: string;
  description?: string;
  createdAt: string;  // maps to created_at
  updatedAt: string;  // maps to updated_at
}

/**
 * Persona profile entity
 * Maps to persona_profiles table in Supabase
 */
export interface PersonaProfile {
  id: string;
  tenantId: string;  // maps to tenant_id
  name: string;
  tone?: string;
  goals?: string[];
  createdAt: string;  // maps to created_at
  updatedAt: string;  // maps to updated_at
}

/**
 * Strategy entity
 * Maps to strategies table in Supabase
 */
export interface Strategy {
  id: string;
  tenantId: string;  // maps to tenant_id
  title: string;
  description: string;
  status: StrategyStatus;
  createdBy: string;  // maps to created_by
  approvedBy?: string;  // maps to approved_by
  createdAt: string;  // maps to created_at
  updatedAt: string;  // maps to updated_at
  dueDate?: string;  // maps to due_date
  priority?: StrategyPriority;
  tags?: string[];
  completionPercentage: number;  // maps to completion_percentage
}

/**
 * Patched strategy with partial fields and source info
 */
export interface PatchedStrategy {
  id: string;
  changes: Partial<Strategy>;
  source: string;
  reason?: string;
}

/**
 * Plugin entity
 * Maps to plugins table in Supabase
 */
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: PluginStatus;
  xp: number;
  roi: number;
  createdAt: string;  // maps to created_at
  updatedAt: string;  // maps to updated_at
  icon?: string;
  category?: string;
  metadata?: Record<string, any>;
}

/**
 * Agent version entity
 * Maps to agent_versions table in Supabase
 */
export interface AgentVersion {
  id: string;
  pluginId: string;  // maps to plugin_id
  version: string;
  prompt: string;
  status: AgentVersionStatus;
  xp: number;
  createdAt: string;  // maps to created_at
  updatedAt: string;  // maps to updated_at
  createdBy?: string;  // maps to created_by
  upvotes: number;
  downvotes: number;
}

/**
 * Plugin log entity
 * Maps to plugin_logs table in Supabase
 */
export interface PluginLog {
  id: string;
  pluginId?: string;  // maps to plugin_id
  strategyId?: string;  // maps to strategy_id
  tenantId: string;  // maps to tenant_id
  agentVersionId?: string;  // maps to agent_version_id
  status: ExecutionStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  createdAt: string;  // maps to created_at
  executionTime: number;  // maps to execution_time
  xpEarned: number;  // maps to xp_earned
}

/**
 * Key performance indicator entity
 * Maps to kpis table in Supabase
 */
export interface KpiMetric {
  id: string;
  tenantId: string;  // maps to tenant_id
  name: string;
  value: number;
  previousValue?: number;  // maps to previous_value
  source?: KpiSource;
  category?: KpiCategory;
  date: string;
  createdAt: string;  // maps to created_at
  updatedAt: string;  // maps to updated_at
}

/**
 * Agent vote entity
 * Maps to agent_votes table in Supabase
 */
export interface AgentVote {
  id: string;
  agentVersionId: string;  // maps to agent_version_id
  userId: string;  // maps to user_id
  voteType: VoteType;  // maps to vote_type
  comment?: string;
  createdAt: string;  // maps to created_at
}

/**
 * System log entity
 * Maps to system_logs table in Supabase
 */
export interface SystemLog {
  id: string;
  tenantId: string;  // maps to tenant_id
  module: SystemLogModule;
  event: string;
  context?: Record<string, any>;
  createdAt: string;  // maps to created_at
}

/**
 * Execution record entity
 * Maps to executions table in Supabase
 */
export interface ExecutionLog {
  id: string;
  tenantId: string;  // maps to tenant_id
  strategyId?: string;  // maps to strategy_id
  pluginId?: string;  // maps to plugin_id
  agentVersionId?: string;  // maps to agent_version_id
  executedBy?: string;  // maps to executed_by
  type: 'plugin' | 'agent' | 'strategy';
  status: ExecutionStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  executionTime?: number;  // maps to execution_time
  xpEarned?: number;  // maps to xp_earned
  createdAt: string;  // maps to created_at
}

/**
 * Agent task entity for tracking agent responsibilities
 */
export interface AgentTask {
  id: string;
  agentId: string;
  taskType: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  priority: number;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Webhook event payload
 */
export interface WebhookEvent {
  id: string;
  eventType: BusinessEventType;
  payload: Record<string, any>;
  timestamp: string;
  source: string;
}

/**
 * User entity with extended profile information
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

// ==============================
// Edge Function Input Types
// ==============================

/**
 * Input parameters for executing a strategy
 */
export interface ExecuteStrategyInput {
  strategyId: string;  // maps to strategy_id
  tenantId: string;    // maps to tenant_id
  userId?: string | null;  // maps to user_id
  options?: Record<string, any>;
}

/**
 * Result of strategy execution
 */
export interface ExecuteStrategyResult {
  success: boolean;
  strategyId?: string;  // maps to strategy_id
  message?: string;
  error?: string;
  data?: any;
  executionId?: string;  // maps to execution_id
  executionTime?: number;  // maps to execution_time
  pluginsExecuted?: number;  // maps to plugins_executed
  successfulPlugins?: number;  // maps to successful_plugins
  xpEarned?: number;  // maps to xp_earned
  status?: ExecutionStatus;
}

/**
 * Input for updating KPIs
 */
export interface UpdateKpisInput {
  tenantId: string;  // maps to tenant_id
  sources?: KpiSource[];
  runMode?: 'cron' | 'manual' | 'scheduled';  // maps to run_mode
}

/**
 * Input for syncing MQLs
 */
export interface SyncMqlsInput {
  tenantId: string;  // maps to tenant_id
  authToken: string;  // maps to auth_token
}

/**
 * Input for analyzing prompt differences
 */
export interface AnalyzePromptDiffInput {
  currentPrompt: string;  // maps to current_prompt
  previousPrompt: string;  // maps to previous_prompt
  pluginId?: string;  // maps to plugin_id
  agentVersionId?: string;  // maps to agent_version_id
}

/**
 * Standard response type for edge functions
 */
export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;  // maps to execution_time
}

// ==============================
// Zod Schema Validations
// ==============================

/**
 * UUID schema validation
 */
export const uuidSchema = z.string().uuid();

/**
 * Execute strategy input validation schema
 */
export const executeStrategySchema = z.object({
  strategyId: uuidSchema,  // maps to strategy_id in backend
  tenantId: uuidSchema,    // maps to tenant_id in backend
  userId: uuidSchema.optional().nullable(),  // maps to user_id in backend
  options: z.record(z.unknown()).optional().default({})
});

/**
 * Update KPIs input validation schema
 */
export const updateKPIsSchema = z.object({
  tenantId: uuidSchema.optional(),  // maps to tenant_id in backend
  sources: z.array(z.enum(['stripe', 'ga4', 'hubspot'])).optional(),
  runMode: z.enum(['cron', 'manual', 'scheduled']).optional().default('cron')  // maps to run_mode in backend
});

/**
 * Sync MQLs input validation schema
 */
export const syncMQLsSchema = z.object({
  tenantId: uuidSchema.optional(),  // maps to tenant_id in backend
  hubspotApiKey: z.string().optional()  // maps to hubspot_api_key in backend
});

/**
 * Analyze prompt diff input validation schema
 */
export const analyzePromptDiffSchema = z.object({
  currentPrompt: z.string(),  // maps to current_prompt in backend
  previousPrompt: z.string(),  // maps to previous_prompt in backend
  pluginId: uuidSchema.optional(),  // maps to plugin_id in backend
  agentVersionId: uuidSchema.optional()  // maps to agent_version_id in backend
});

/**
 * Helper function for converting snake_case DB fields to camelCase
 * Use this when processing data from Supabase
 */
export function snakeToCamel<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  
  return result as T;
}

/**
 * Helper function for converting camelCase TypeScript fields to snake_case for DB
 * Use this when sending data to Supabase
 */
export function camelToSnake<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  
  return result as T;
}
