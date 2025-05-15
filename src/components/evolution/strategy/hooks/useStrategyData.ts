
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';

export const useStrategyData = (strategyId: string) => {
  // Query for the strategy data
  const { 
    data: strategy,
    error: strategyError,
    isLoading: isStrategyLoading
  } = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async (): Promise<Strategy | null> => {
      if (!strategyId || strategyId === 'default') {
        return null;
      }
      
      const { data: strategyData, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!strategyData) return null;
      
      return {
        id: strategyData.id,
        tenant_id: strategyData.tenant_id || '',
        title: strategyData.title || '',
        description: strategyData.description || '',
        status: (strategyData.status as Strategy['status']) || 'draft',
        created_by: strategyData.created_by || '',
        created_at: strategyData.created_at || '',
        updated_at: strategyData.updated_at || '',
        approved_by: strategyData.approved_by || undefined,
        approved_at: strategyData.approved_at || undefined,
        rejected_by: strategyData.rejected_by || undefined,
        rejected_at: strategyData.rejected_at || undefined,
        priority: strategyData.priority as Strategy['priority'] || undefined,
        tags: strategyData.tags || undefined,
        completion_percentage: strategyData.completion_percentage || undefined,
        due_date: strategyData.due_date || undefined
      };
    },
    enabled: !!strategyId && strategyId !== 'default',
  });

  // Query for the creator user data
  const { 
    data: createdByUser,
    error: createdByError,
    isLoading: isCreatorLoading 
  } = useQuery({
    queryKey: ['user', strategy?.created_by],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', strategy?.created_by)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!strategy?.created_by,
  });

  // Query for the approver user data
  const { 
    data: approvedByUser,
    error: approvedByError,
    isLoading: isApproverLoading 
  } = useQuery({
    queryKey: ['user', strategy?.approved_by],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', strategy?.approved_by)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!strategy?.approved_by,
  });

  // Combine all errors
  const error = strategyError || createdByError || approvedByError || null;
  
  // Combined loading state
  const loading = isStrategyLoading || 
    (!!strategy?.created_by && isCreatorLoading) || 
    (!!strategy?.approved_by && isApproverLoading);

  return {
    strategy,
    loading,
    error: error ? (error as Error).message : null,
    createdByUser,
    approvedByUser
  };
};

export default useStrategyData;
