
import { useState, useEffect } from 'react';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { supabaseWithErrorHandler } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Strategy } from '@/types';

export const useDashboardData = (tenantId: string | undefined) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (tenantId) {
      fetchData(tenantId);
    }
  }, [tenantId]);

  const fetchData = async (tenantId: string) => {
    setIsLoading(true);
    try {
      // Fetch KPI data
      const kpiTrends = await fetchKpiTrends(tenantId);
      setKpiData(kpiTrends);
      
      // Fetch strategies
      const { data, error } = await supabaseWithErrorHandler
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (error) {
        console.error('Error fetching strategies:', error);
        throw error;
      }
      
      setStrategies(data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast({
        title: 'Error loading dashboard',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    strategies,
    kpiData,
    isLoading,
    refetch: () => tenantId && fetchData(tenantId)
  };
};
