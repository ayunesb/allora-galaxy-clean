
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';

export const useStrategyData = (strategyId: string) => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByUser, setCreatedByUser] = useState<any>(null);
  const [approvedByUser, setApprovedByUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategyDetails = async () => {
      if (!strategyId || strategyId === 'default') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch strategy
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .maybeSingle();
          
        if (strategyError) throw strategyError;

        if (strategyData) {
          const typedStrategy: Strategy = {
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
          
          setStrategy(typedStrategy);
        }
        
        // Fetch created by user
        if (strategyData?.created_by) {
          const { data: createdBy, error: createdByError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', strategyData.created_by)
            .maybeSingle();
            
          if (!createdByError && createdBy) {
            setCreatedByUser(createdBy);
          }
        }
        
        // Fetch approved by user
        if (strategyData?.approved_by) {
          const { data: approvedBy, error: approvedByError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', strategyData.approved_by)
            .maybeSingle();
            
          if (!approvedByError && approvedBy) {
            setApprovedByUser(approvedBy);
          }
        }
      } catch (err: any) {
        console.error('Error fetching strategy details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategyDetails();
  }, [strategyId]);

  return {
    strategy,
    loading,
    error,
    createdByUser,
    approvedByUser
  };
};

export default useStrategyData;
