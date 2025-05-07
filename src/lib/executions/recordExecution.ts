
import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput } from '@/types/fixed';
import { camelToSnake } from '@/types/fixed';

/**
 * Record an execution in the database
 * @param input - Execution record input
 * @returns The created execution record
 */
export async function recordExecution(input: ExecutionRecordInput) {
  try {
    const { data, error } = await supabase
      .from('executions')
      .insert(camelToSnake(input))
      .select()
      .single();
      
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error recording execution:', error);
    throw error;
  }
}
