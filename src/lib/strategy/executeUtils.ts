
import { ExecuteStrategyInput, ValidationResult } from './types';
import { getEnvVar } from '../edge/envManager';
import { createClient } from '@supabase/supabase-js';

/**
 * Validate strategy execution input
 * @param input The input to validate
 * @returns Validation result
 */
export function validateInput(input: any): ValidationResult {
  const errors: string[] = [];
  
  if (!input) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!input.strategy_id) {
    errors.push("strategy_id is required");
  }
  
  if (!input.tenant_id) {
    errors.push("tenant_id is required");
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Create a Supabase admin client with service role
 * @returns Supabase client instance or null if environment variables are missing
 */
export function createSupabaseAdmin() {
  const supabaseUrl = getEnvVar("SUPABASE_URL");
  const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Log execution start to database
 * @param supabase Supabase client
 * @param executionId Unique execution ID
 * @param input Execution input
 * @returns Success status
 */
export async function logExecutionStart(
  supabase: any,
  executionId: string,
  input: ExecuteStrategyInput
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('executions')
      .insert({
        id: executionId,
        tenant_id: input.tenant_id,
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        type: 'strategy',
        status: 'pending',
        input: input.options || {},
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`Failed to record execution start: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error recording execution start:", error);
    return false;
  }
}

/**
 * Log execution completion to database
 * @param supabase Supabase client
 * @param executionId Unique execution ID
 * @param status Execution status
 * @param output Execution output
 * @param executionTime Time taken to execute
 * @param xpEarned XP earned from execution
 */
export async function logExecutionComplete(
  supabase: any,
  executionId: string,
  status: 'success' | 'partial' | 'failure',
  output: any,
  executionTime: number,
  xpEarned: number
): Promise<void> {
  try {
    await supabase
      .from('executions')
      .update({
        status,
        output,
        execution_time: executionTime,
        xp_earned: xpEarned
      })
      .eq('id', executionId);
  } catch (error) {
    console.error("Error updating execution record:", error);
  }
}

/**
 * Log plugin execution to database
 * @param supabase Supabase client
 * @param tenantId Tenant ID
 * @param strategyId Strategy ID
 * @param pluginId Plugin ID
 * @param status Execution status
 * @param input Execution input
 * @param output Execution output 
 * @param error Error message if any
 * @param executionTime Time taken to execute
 * @param xpEarned XP earned from execution
 * @returns Log entry ID or null on error
 */
export async function logPluginExecution(
  supabase: any,
  tenantId: string,
  strategyId: string,
  pluginId: string,
  status: 'success' | 'failure' | 'pending',
  input: any,
  output: any = null,
  error: string | null = null,
  executionTime: number = 0,
  xpEarned: number = 0
): Promise<string | null> {
  try {
    const { data, error: logError } = await supabase
      .from('plugin_logs')
      .insert({
        plugin_id: pluginId,
        strategy_id: strategyId,
        tenant_id: tenantId,
        status,
        input,
        output,
        error,
        execution_time: executionTime,
        xp_earned
      })
      .select('id')
      .single();
    
    if (logError) {
      console.error(`Failed to log plugin execution: ${logError.message}`);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error("Error logging plugin execution:", error);
    return null;
  }
}

/**
 * Log system event to database
 * @param supabase Supabase client
 * @param tenantId Tenant ID
 * @param module System module
 * @param event Event name
 * @param context Event context
 */
export async function logSystemEvent(
  supabase: any,
  tenantId: string,
  module: string,
  event: string,
  context: any = {}
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module,
        event,
        context
      });
  } catch (error) {
    console.error("Error logging system event:", error);
  }
}
