
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Strategy } from '@/types/strategy';
import { KPI } from '@/types/kpi';

export const useDashboardData = (tenantId: string | null) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (tenantId) {
      Promise.all([
        fetchStrategies(tenantId),
        fetchKPIs(tenantId)
      ])
      .then(([strategiesData, kpisData]) => {
        setStrategies(strategiesData);
        setKpis(kpisData);
      })
      .catch((err) => {
        console.error('Error loading dashboard data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [tenantId, toast]);
  
  const fetchStrategies = async (tenantId: string): Promise<Strategy[]> => {
    // This is a mock implementation
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        title: 'Increase Sales',
        description: 'Boost sales by 20% in Q3',
        status: 'active',
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        created_by: 'user1',
      },
      {
        id: '2',
        title: 'Expand to New Markets',
        description: 'Research and enter 2 new geographic regions',
        status: 'pending',
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        created_by: 'user1',
      },
    ] as Strategy[];
  };
  
  const fetchKPIs = async (tenantId: string): Promise<KPI[]> => {
    // This is a mock implementation
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return [
      {
        id: '1',
        name: 'Monthly Revenue',
        value: 125000,
        previous_value: 115000,
        date: new Date().toISOString().split('T')[0],
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'New Customers',
        value: 45,
        previous_value: 38,
        date: new Date().toISOString().split('T')[0],
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
      },
    ] as KPI[];
  };
  
  return {
    strategies,
    kpis,
    isLoading,
  };
};

export default useDashboardData;
