
import { supabase } from '@/integrations/supabase/client';
import { ExecutionRecordInput } from '@/types/fixed';

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
          .update(updateData)
          .eq('id', id)
          .select()
          .single());
      } else {
        // Create new record
        ({ data, error } = await supabase
          .from('executions')
          .insert(input)
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
