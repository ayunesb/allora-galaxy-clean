
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Remove the unused KPI import and use direct type
import { Strategy } from '@/types/strategy';

interface KPI {
  id: string;
  name: string;
  value: number;
  date: string;
  category: string;
  previous_value?: number;
}

interface DashboardData {
  strategies: Strategy[];
  kpis: KPI[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    strategies: [],
    kpis: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch strategies
        const { data: strategiesData } = await supabase
          .from('strategies')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Fetch KPIs
        const { data: kpisData } = await supabase
          .from('kpis')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);
        
        setData({
          strategies: strategiesData || [],
          kpis: kpisData || [],
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return {
    data,
    isLoading,
  };
};
