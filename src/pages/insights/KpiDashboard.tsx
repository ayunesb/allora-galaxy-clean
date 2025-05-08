
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/KPICard';
import { TrendDirection } from '@/types/shared';
import { useToast } from '@/hooks/use-toast';

const KpiDashboard = () => {
  const { tenant } = useWorkspace();
  const [kpiData, setKpiData] = useState<any[]>([]);
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
      // Fetch KPI data
      const kpiTrends = await fetchKpiTrends(tenant?.id || '');
      setKpiData(kpiTrends);
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
  
  // Format trend data for KPI cards
  const getKpiTrend = (name: string): { value: number; direction: TrendDirection; percentage: number } => {
    const kpi = kpiData.find(k => k.name === name);
    if (!kpi) {
      return { value: 0, direction: 'neutral', percentage: 0 };
    }
    
    const currentValue = kpi.value || 0;
    const previousValue = kpi.previousValue || 0;
    
    if (previousValue === 0) {
      return { value: currentValue, direction: 'neutral', percentage: 0 };
    }
    
    const percentage = ((currentValue - previousValue) / previousValue) * 100;
    const direction: TrendDirection = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    
    return {
      value: currentValue,
      direction,
      percentage: Math.abs(percentage)
    };
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Key Performance Indicators</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded-full w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded-full w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded-full w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>KPI Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed KPI analytics will be displayed here. Coming soon.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Conversion funnel visualization will be displayed here. Coming soon.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Campaign performance metrics will be displayed here. Coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiDashboard;
