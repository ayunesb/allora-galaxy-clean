
import { supabase } from '@/lib/supabase';
import { Strategy } from '@/types/strategy';
import { NotFoundError, ValidationError } from '@/lib/edge/errorUtils';

export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
  requireApproval?: boolean;
}

export async function validateStrategyForExecution(input: ExecuteStrategyInput): Promise<Strategy> {
  // Check required fields
  if (!input.strategy_id || !input.tenant_id) {
    throw new ValidationError('strategy_id and tenant_id are required fields');
  }
  
  // Fetch the strategy
  const { data: strategy, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', input.strategy_id)
    .eq('tenant_id', input.tenant_id)
    .single();
    
  if (error || !strategy) {
    throw new NotFoundError(`Strategy not found or you don't have access to it`);
  }
  
  // Check if the strategy requires approval
  if (input.requireApproval && strategy.status !== 'approved') {
    throw new ValidationError(`Strategy must be approved before execution. Current status: ${strategy.status}`);
  }
  
  return strategy as Strategy;
}

export async function trackExecution(strategyId: string, tenantId: string, status: string, userId?: string): Promise<string> {
  const executionData = {
    strategy_id: strategyId,
    tenant_id: tenantId,
    status,
    user_id: userId || null,
    started_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('executions')
    .insert(executionData)
    .select('id')
    .single();
    
  if (error || !data) {
    console.error('Error tracking execution:', error);
    throw new Error('Failed to create execution record');
  }
  
  return data.id;
}

export async function updateExecutionStatus(
  executionId: string, 
  status: string, 
  result?: any, 
  error?: string
) {
  const updateData = {
    status,
    completed_at: new Date().toISOString(),
    result: result || null,
    error: error || null,
  };
  
  const { error: updateError } = await supabase
    .from('executions')
    .update(updateData)
    .eq('id', executionId);
    
  if (updateError) {
    console.error('Error updating execution status:', updateError);
  }
}
