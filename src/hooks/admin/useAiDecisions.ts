
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AiDecision } from '@/components/admin/ai-decisions/types';
import { fetchAiDecisions } from '@/services/adminService';
import { useTenantId } from '@/hooks/useTenantId';

export const useAiDecisionsData = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<AiDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch decisions data
  const fetchData = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAiDecisions({ tenant_id: tenantId, limit: 100 });
      setDecisions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI decisions');
      toast({
        title: 'Error loading AI decisions',
        description: 'There was a problem loading the AI decisions data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId]);

  return {
    decisions,
    isLoading,
    error,
    refetch: fetchData
  };
};

export default useAiDecisionsData;
