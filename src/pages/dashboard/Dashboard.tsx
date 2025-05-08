
import { useState, useEffect } from 'react';
import { Strategy } from '@/types';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import KPICard from '@/components/KPICard';
import { StrategyCard } from '@/components/dashboard/StrategyCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TrendDirection } from '@/types/shared';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { tenant } = useWorkspace();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
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
      const kpiTrends = await fetchKpiTrends(tenant?.id || '', {
        period: 'monthly'
      });
      setKpiData(kpiTrends);
      
      // Fetch strategies
      if (tenant?.id) {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(4);
          
        if (error) {
          console.error('Error fetching strategies:', error);
          throw error;
        }
        
        setStrategies(data || []);
      }
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
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
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
      
      <Tabs defaultValue="all" className="mt-8">
        <TabsList>
          <TabsTrigger value="all">All Strategies</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <p>Loading strategies...</p>
            ) : strategies.length > 0 ? (
              strategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  id={strategy.id}
                  title={strategy.title}
                  description={strategy.description}
                  status={strategy.status === 'approved' ? 'active' : strategy.status === 'rejected' ? 'archived' : strategy.status}
                  priority={strategy.priority as 'high' | 'medium' | 'low' | undefined}
                  completionPercentage={strategy.completion_percentage || 0}
                  createdBy={strategy.created_by === 'ai' ? 'ai' : 'human'}
                  tags={strategy.tags || []}
                />
              ))
            ) : (
              <Card className="p-6 text-center col-span-full">
                <p className="text-muted-foreground mb-4">No strategies found</p>
                <Button asChild>
                  <a href="/launch">Create Strategy</a>
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <p>Loading strategies...</p>
            ) : strategies.filter(s => s.status === 'pending').length > 0 ? (
              strategies
                .filter(s => s.status === 'pending')
                .map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    id={strategy.id}
                    title={strategy.title}
                    description={strategy.description}
                    status="pending"
                    priority={strategy.priority as 'high' | 'medium' | 'low' | undefined}
                    completionPercentage={strategy.completion_percentage || 0}
                    createdBy={strategy.created_by === 'ai' ? 'ai' : 'human'}
                    tags={strategy.tags || []}
                  />
                ))
            ) : (
              <Card className="p-6 text-center col-span-full">
                <p className="text-muted-foreground">No pending strategies</p>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <p>Loading strategies...</p>
            ) : strategies.filter(s => s.status === 'approved' || s.status === 'in_progress').length > 0 ? (
              strategies
                .filter(s => s.status === 'approved' || s.status === 'in_progress')
                .map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    id={strategy.id}
                    title={strategy.title}
                    description={strategy.description}
                    status="active"
                    priority={strategy.priority as 'high' | 'medium' | 'low' | undefined}
                    completionPercentage={strategy.completion_percentage || 0}
                    createdBy={strategy.created_by === 'ai' ? 'ai' : 'human'}
                    tags={strategy.tags || []}
                  />
                ))
            ) : (
              <Card className="p-6 text-center col-span-full">
                <p className="text-muted-foreground">No active strategies</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
