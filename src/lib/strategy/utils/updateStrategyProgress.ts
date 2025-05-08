
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a strategy's progress based on execution results
 * @param strategyId Strategy ID to update
 * @param tenantId Tenant ID for verification
 * @param status Execution status
 * @param currentPercentage Current completion percentage
 * @returns Success status
 */
export async function updateStrategyProgress(
  strategyId: string,
  tenantId: string,
  status: 'success' | 'partial' | 'failure',
  currentPercentage: number = 0
): Promise<boolean> {
  if (status === 'failure') {
    return false;
  }
  
  try {
    // Update strategy progress if execution was successful
    const { error } = await supabase
      .from('strategies')
      .update({
        completion_percentage: Math.min(100, currentPercentage + 25)
      })
      .eq('id', strategyId)
      .eq('tenant_id', tenantId);
      
    return !error;
  } catch (error) {
    console.error(`Error updating strategy progress for ${strategyId}:`, error);
    return false;
  }
}
