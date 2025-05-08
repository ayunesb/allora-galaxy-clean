
// Fix strategy type compatibility issues
import React from 'react';
import { useTenantId } from '@/hooks/useTenantId';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Strategy, KPI } from '@/types';
import StrategyCard from '@/components/dashboard/StrategyCard';
import KPICard from '@/components/KPICard';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, BarChart4, Plus } from 'lucide-react';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { KPITrend } from '@/types/shared';

// Sample data for the chart
const performanceData = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 19 },
  { name: 'Mar', value: 15 },
  { name: 'Apr', value: 22 },
  { name: 'May', value: 30 },
  { name: 'Jun', value: 28 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant } = useWorkspace();
  const tenantId = useTenantId();
  const { toast } = useToast();
  
  // Query for strategies
  const { data: strategies, isLoading: isLoadingStrategies } = useQuery({
    queryKey: ['strategies', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data as Strategy[];
    },
    enabled: !!tenantId,
  });

  // Query for KPIs
  const { data: kpis, isLoading: isLoadingKpis } = useQuery({
    queryKey: ['kpis', tenantId],
    queryFn: async () => {
      const trends = await fetchKpiTrends(tenantId);
      return trends.mrr.slice(0, 4); // Just return the first 4 MRR KPIs
    },
    enabled: !!tenantId,
  });

  const handleLaunchStrategy = async (id: string) => {
    if (!currentTenant) return;
    
    try {
      // Navigate to the strategy page for launch
      navigate(`/strategies/${id}/launch`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Helper function to convert our Strategy type to the format StrategyCard expects
  const mapStrategyToCardProps = (strategy: Strategy) => {
    return {
      id: strategy.id,
      title: strategy.title,
      description: strategy.description,
      status: strategy.status as any, // The Status type is compatible
      priority: strategy.priority as any, // Convert string to priority type
      tags: strategy.tags,
      dueDate: strategy.due_date,
      createdBy: strategy.created_by ? 'ai' : 'human', // Simplified logic
      completionPercentage: strategy.completion_percentage,
      onLaunch: handleLaunchStrategy
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Welcome and Summary */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to Allora OS</h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered business operating system
        </p>
      </div>
      
      {/* KPI Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Key Metrics</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/insights/kpis')}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingKpis ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))
          ) : kpis && kpis.length > 0 ? (
            kpis.map((kpi: KPITrend) => (
              <KPICard key={kpi.id} data={kpi} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-36">
                <p className="text-center text-muted-foreground">No KPI data available</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/insights/kpis')}>
                  Set up KPIs
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Strategy Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Strategies</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/strategies')}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingStrategies ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))
          ) : strategies && strategies.length > 0 ? (
            strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                {...mapStrategyToCardProps(strategy)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center h-64">
                <p className="text-center text-muted-foreground">No strategies available</p>
                <Button className="mt-2" onClick={() => navigate('/strategies/new')}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create Strategy
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Performance Chart */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/insights/performance')}>
            View details <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            size="lg"
            className="h-auto py-4 flex-col items-center justify-center"
            onClick={() => navigate('/strategies/new')}
          >
            <Plus className="h-6 w-6 mb-2" />
            <span>Create Strategy</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="h-auto py-4 flex-col items-center justify-center"
            onClick={() => navigate('/launch')}
          >
            <BarChart4 className="h-6 w-6 mb-2" />
            <span>Launch Campaign</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="h-auto py-4 flex-col items-center justify-center"
            onClick={() => navigate('/plugins')}
          >
            <BarChart4 className="h-6 w-6 mb-2" />
            <span>Explore Plugins</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
