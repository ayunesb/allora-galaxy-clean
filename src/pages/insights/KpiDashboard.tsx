
import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KPI } from '@/types/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, BarChart3, DollarSign, RefreshCw, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const KpiDashboard = () => {
  const { currentTenant } = useWorkspace();

  const { data: kpiData, isLoading, refetch } = useQuery({
    queryKey: ['kpi-data', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant) return [];

      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as Array<{
        id: string;
        name: string;
        value: number;
        previous_value?: number;
        date: string;
        category: string;
        source?: string;
        tenant_id: string;
      }>;
    },
    enabled: !!currentTenant
  });

  // Group KPIs by category
  const financialKpis = kpiData?.filter(kpi => kpi.category === 'financial') || [];
  const marketingKpis = kpiData?.filter(kpi => kpi.category === 'marketing') || [];
  const salesKpis = kpiData?.filter(kpi => kpi.category === 'sales') || [];

  // Format data for charts
  const formatChartData = (kpis: KPI[], kpiName: string) => {
    const filteredKpis = kpis
      .filter(kpi => kpi.name === kpiName)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return filteredKpis.map(kpi => ({
      date: new Date(kpi.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: kpi.value
    }));
  };

  const mrrData = formatChartData(financialKpis, 'Monthly Recurring Revenue');
  const mqlData = formatChartData(marketingKpis, 'Marketing Qualified Leads');

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number | null | undefined) => {
    if (previous === null || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Format percentage change for display
  const formatPercentageChange = (change: number | null) => {
    if (change === null) return "—";
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Get the most recent KPI value
  const getLatestKpi = (kpis: KPI[], kpiName: string) => {
    return kpis.find(kpi => kpi.name === kpiName);
  };

  const latestMrr = getLatestKpi(financialKpis, 'Monthly Recurring Revenue');
  const latestMql = getLatestKpi(marketingKpis, 'Marketing Qualified Leads');

  const mrrChange = latestMrr ? getPercentageChange(latestMrr.value, latestMrr.previous_value) : null;
  const mqlChange = latestMql ? getPercentageChange(latestMql.value, latestMql.previous_value) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">KPI Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track key performance indicators for your business
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* MRR Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Recurring Revenue</CardDescription>
            <div className="flex justify-between items-start">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">
                  ${latestMrr?.value?.toLocaleString() || 0}
                </CardTitle>
              )}
              {!isLoading && mrrChange !== null && (
                <div className={`flex items-center`}>
                  <Badge className={`flex items-center ${mrrChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {mrrChange >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{formatPercentageChange(mrrChange)}</span>
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* MQL Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Marketing Qualified Leads</CardDescription>
            <div className="flex justify-between items-start">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">
                  {latestMql?.value?.toLocaleString() || 0}
                </CardTitle>
              )}
              {!isLoading && mqlChange !== null && (
                <div className={`flex items-center`}>
                  <Badge className={`flex items-center ${mqlChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {mqlChange >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{formatPercentageChange(mqlChange)}</span>
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={mqlData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={40} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for another KPI */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer Acquisition Cost</CardDescription>
            <div className="flex justify-between items-start">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <CardTitle className="text-2xl">$125</CardTitle>
              )}
              <Badge className="flex items-center bg-green-500">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>3.2%</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[120px] w-full" />
            ) : (
              <div className="h-[120px] flex items-center justify-center text-muted-foreground">
                <p>No historical data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All KPIs</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Key Performance Indicators</CardTitle>
              <CardDescription>
                Overview of all tracked metrics across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : kpiData && kpiData.length > 0 ? (
                <div className="space-y-4">
                  {kpiData.slice(0, 10).map((kpi) => (
                    <div key={kpi.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{kpi.name}</p>
                        <p className="text-sm text-muted-foreground">{kpi.date}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="font-medium mr-4">
                          {kpi.name.includes('Revenue') ? '$' : ''}{kpi.value.toLocaleString()}
                        </p>
                        {kpi.previous_value && (
                          <Badge 
                            className={`flex items-center ${kpi.value >= kpi.previous_value ? 'bg-green-500' : 'bg-red-500'}`}
                          >
                            {kpi.value >= kpi.previous_value ? (
                              <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            <span>
                              {formatPercentageChange(getPercentageChange(kpi.value, kpi.previous_value))}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No KPI data available</h3>
                  <p className="text-muted-foreground">
                    KPI data will appear here once it's collected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>
                Revenue, costs, and other financial indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <DollarSign className="h-12 w-12 mb-2" />
                  <p className="ml-2">Financial metrics visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="marketing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Metrics</CardTitle>
              <CardDescription>
                Leads, conversions, and campaign performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Users className="h-12 w-12 mb-2" />
                  <p className="ml-2">Marketing metrics visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Metrics</CardTitle>
              <CardDescription>
                Deals, pipeline, and revenue forecasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-2" />
                  <p className="ml-2">Sales metrics visualization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpiDashboard;
