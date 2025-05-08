
import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput, LogStatus, camelToSnake } from '@/types/fixed';

/**
 * Record a new execution
 */
export async function recordExecution(input: ExecutionRecordInput) {
  try {
    // Convert camelCase to snake_case for Supabase
    const snakeCaseInput = camelToSnake(input);
    
    const { data, error } = await supabase
      .from('executions')
      .insert(snakeCaseInput)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error('Error recording execution:', err);
    throw err;
  }
}

/**
 * Update an existing execution
 */
export async function updateExecution(id: string, updates: Partial<ExecutionRecordInput>) {
  try {
    // Convert camelCase to snake_case for Supabase
    const snakeCaseUpdates = camelToSnake(updates);
    
    const { data, error } = await supabase
      .from('executions')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error('Error updating execution:', err);
    throw err;
  }
}

/**
 * Get an execution by ID
 */
export async function getExecution(id: string) {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error('Error fetching execution:', err);
    return null;
  }
}

/**
 * Get recent executions for a tenant
 */
export async function getRecentExecutions(tenantId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error('Error fetching recent executions:', err);
    return [];
  }
}
