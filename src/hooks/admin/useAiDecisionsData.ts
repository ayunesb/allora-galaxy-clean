
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAiDecisions } from '@/services/adminService';
import { useTenantId } from '@/hooks/useTenantId';
import { AiDecisionFilters } from '@/services/adminService';

export const useAiDecisionsData = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [filters, setFilters] = useState<AiDecisionFilters>({
    tenant_id: tenantId,
    limit: 50
  });

  const { 
    data: decisions = [], 
    isLoading,
    error,
    refetch,
    isFetching
  } = useAiDecisions(filters);

  // Update tenant_id in filters when it changes
  useEffect(() => {
    if (tenantId) {
      setFilters(prev => ({
        ...prev,
        tenant_id: tenantId
      }));
    }
  }, [tenantId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading AI decisions',
        description: 'There was a problem loading the AI decision data.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const updateFilters = (newFilters: Partial<AiDecisionFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return {
    decisions,
    isLoading: isLoading || isFetching,
    error,
    filters,
    updateFilters,
    refetch
  };
};

export default useAiDecisionsData;
