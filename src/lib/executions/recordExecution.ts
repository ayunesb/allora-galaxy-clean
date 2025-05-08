
import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput, LogStatus } from '@/types/fixed';
import { camelToSnake } from '@/types/fixed';

/**
 * Record an execution in the database with retry logic
 * @param input - Execution record input
 * @returns The created execution record
 */
export async function recordExecution(input: ExecutionRecordInput & { id?: string }) {
  // Configuration
  const MAX_RETRY_ATTEMPTS = 3;
  const BASE_RETRY_DELAY = 500; // ms
  
  let attempt = 0;
  let lastError: any = null;
  
  while (attempt < MAX_RETRY_ATTEMPTS) {
    try {
      // If input has an id, update existing record, otherwise insert new one
      let data, error;
      
      if (input.id) {
        // Update existing record
        const { id, ...updateData } = input; // Extract id from input data
        ({ data, error } = await supabase
          .from('executions')
          .update(camelToSnake(updateData))
          .eq('id', id)
          .select()
          .single());
      } else {
        // Create new record
        ({ data, error } = await supabase
          .from('executions')
          .insert(camelToSnake(input))
          .select()
          .single());
      }
      
      if (error) throw error;
      return data;
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Log the retry attempt
      console.warn(`Error recording execution (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        // Exponential backoff with jitter
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  console.error(`Failed to record execution after ${MAX_RETRY_ATTEMPTS} attempts:`, lastError);
  throw lastError || new Error(`Failed to record execution after ${MAX_RETRY_ATTEMPTS} attempts`);
}

/**
 * Update an existing execution record with additional data
 * @param executionId - ID of the execution to update
 * @param updateData - Partial update data
 * @returns The updated execution record
 */
export async function updateExecution(executionId: string, updateData: Partial<ExecutionRecordInput>) {
  return recordExecution({
    id: executionId,
    ...updateData as ExecutionRecordInput
  });
}

/**
 * Get execution details by ID
 * @param executionId - ID of the execution to retrieve
 * @returns The execution record or null if not found
 */
export async function getExecution(executionId: string) {
  try {
    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('id', executionId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting execution:', error);
    return null;
  }
}

/**
 * Get recent executions for a tenant, optionally filtered by type
 * @param tenantId - Tenant ID
 * @param type - Optional execution type filter
 * @param limit - Maximum number of records to return
 * @returns Array of execution records
 */
export async function getRecentExecutions(tenantId: string, type?: string, limit: number = 10) {
  try {
    let query = supabase
      .from('executions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent executions:', error);
    return [];
  }
}
