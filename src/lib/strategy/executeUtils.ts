
import { supabase } from '@/lib/supabase';
import { ExecuteStrategyInput, Strategy } from '@/types';
import { NotFoundError, ValidationError } from '../edge/errorUtils';

/**
 * Verifies that the given strategy exists and is valid for execution
 * 
 * @param input The strategy execution input
 * @returns The validated strategy
 */
export const verifyStrategy = async (input: ExecuteStrategyInput): Promise<Strategy> => {
  const strategyId = input.strategyId;
  const tenantId = input.tenantId;
  
  if (!strategyId) {
    throw new ValidationError('Strategy ID is required');
  }
  
  if (!tenantId) {
    throw new ValidationError('Tenant ID is required');
  }
  
  // Fetch the strategy
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', strategyId)
    .eq('tenant_id', tenantId)
    .maybeSingle();
  
  if (error) {
    throw new Error(`Error fetching strategy: ${error.message}`);
  }
  
  if (!data) {
    throw new NotFoundError(`Strategy with ID ${strategyId} not found for tenant ${tenantId}`);
  }
  
  // Check if the strategy is approved
  if (input.requireApproval !== false && data.status !== 'approved') {
    throw new ValidationError(`Strategy must be approved before execution (current status: ${data.status})`);
  }
  
  return data as Strategy;
};
