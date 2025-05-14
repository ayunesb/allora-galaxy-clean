
import { useState, useEffect } from 'react';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { useSupabaseFetch } from '@/hooks/supabase';
import { useToast } from '@/hooks/use-toast';
import { Strategy } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardData = (tenantId: string | undefined) => {
  const [kpiData, setKpiData] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Use the new useSupabaseFetch hook to fetch strategies
  const {
    data: strategies = [],
    isLoading,
    error,
    refetch: refetchStrategies
  } = useSupabaseFetch<Strategy[]>(
    async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    {
      enabled: !!tenantId,
      showErrorToast: true,
      onError: (err) => {
        console.error('Error fetching strategies:', err);
      }
    }
  );

  // Fetch KPI data
  useEffect(() => {
    if (tenantId) {
      fetchKpiTrendsData(tenantId);
    }
  }, [tenantId]);

  const fetchKpiTrendsData = async (tenantId: string) => {
    try {
      const trends = await fetchKpiTrends(tenantId);
      setKpiData(trends);
    } catch (err) {
      console.error('Error fetching KPI trends:', err);
      toast({
        title: 'Error loading KPI data',
        description: 'Failed to load KPI trend data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const refetch = () => {
    if (tenantId) {
      refetchStrategies();
      fetchKpiTrendsData(tenantId);
    }
  };

  return {
    strategies,
    kpiData,
    isLoading,
    refetch
  };
};
