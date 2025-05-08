
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import KPICard from '@/components/KPICard';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TrendDirection } from '@/types/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#eab308', '#0891b2'];

const KpiDashboard = () => {
  const { tenant } = useWorkspace();
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch current KPI trends
      const kpiTrends = await fetchKpiTrends(tenant?.id || '', {
        period: 'monthly'
      });
      setKpiData(kpiTrends);

      // Fetch historical KPI data
      if (tenant?.id) {
        const { data, error } = await supabase
          .from('kpis')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('date', { ascending: true });

        if (error) {
          throw error;
        }

        // Process historical data for charts
        const processedData = processHistoricalData(data || []);
        setHistoricalData(processedData);
      }
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      toast({
        title: 'Error loading KPIs',
        description: 'Failed to load KPI data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Process historical data for charts
  const processHistoricalData = (data: any[]) => {
    const dateGroups: Record<string, any> = {};
    
    // Group by date
    data.forEach(item => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!dateGroups[date]) {
        dateGroups[date] = { date };
      }
      dateGroups[date][item.name] = item.value;
    });
    
    return Object.values(dateGroups);
  };

  // Format trend data for KPI cards
  const getKpiTrend = (name: string): { value: number; direction: TrendDirection; percentage: number } => {
    const kpi = kpiData.find(k => k.name === name);
    if (!kpi) {
      return { value: 0, direction: 'stable', percentage: 0 };
    }
    
    const currentValue = kpi.value || 0;
    const previousValue = kpi.previousValue || 0;
    
    if (previousValue === 0) {
      return { value: currentValue, direction: 'stable', percentage: 0 };
    }
    
    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const direction: TrendDirection = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';
    
    return {
      value: currentValue,
      direction,
      percentage: Math.abs(percentage)
    };
  };

  // Get unique KPI names for chart
  const kpiNames = Array.from(new Set(kpiData.map(kpi => kpi.name)));

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">KPI Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* MRR KPI Card */}
            <KPICard
              title="Monthly Recurring Revenue"
              value={`$${getKpiTrend('mrr').value.toLocaleString()}`}
              trend={getKpiTrend('mrr').percentage}
              trendDirection={getKpiTrend('mrr').direction}
            />
            
            {/* Lead Conversion KPI Card */}
            <KPICard
              title="Lead Conversion"
              value={`${getKpiTrend('lead_conversion').value.toFixed(1)}%`}
              trend={getKpiTrend('lead_conversion').percentage}
              trendDirection={getKpiTrend('lead_conversion').direction}
            />
            
            {/* Website Visitors KPI Card */}
            <KPICard
              title="Website Visitors"
              value={getKpiTrend('website_visitors').value.toLocaleString()}
              trend={getKpiTrend('website_visitors').percentage}
              trendDirection={getKpiTrend('website_visitors').direction}
            />
            
            {/* Social Engagement KPI Card */}
            <KPICard
              title="Social Engagement"
              value={getKpiTrend('social_engagement').value.toLocaleString()}
              trend={getKpiTrend('social_engagement').percentage}
              trendDirection={getKpiTrend('social_engagement').direction}
            />
          </div>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">KPI Trends Over Time</h2>
            {historicalData.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {kpiNames.map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No historical data available</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default KpiDashboard;
