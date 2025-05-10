import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiSection } from '@/components/dashboard/KpiSection';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHelmet from '@/components/PageHelmet';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface KpiData {
  id: string;
  name: string;
  category: string;
  value: number;
  previous_value: number | null;
  date: string;
  source: string;
}

const KpiDashboard: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('revenue');

  const fetchKpiData = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('date', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      setKpiData(data || []);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, [currentWorkspace?.id]);

  // Group KPIs by category
  const kpisByCategory = kpiData.reduce((acc, kpi) => {
    const category = kpi.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(kpi);
    return acc;
  }, {} as Record<string, KpiData[]>);

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number | null): number => {
    if (previous === null || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Prepare chart data
  const prepareChartData = (data: KpiData[]) => {
    // Group by date and sum values
    const groupedByDate = data.reduce((acc, kpi) => {
      const date = kpi.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, value: 0 };
      }
      acc[date].value += kpi.value;
      return acc;
    }, {} as Record<string, { date: string, value: number }>);
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="KPI Dashboard" 
        description="View and analyze key performance indicators"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <Button variant="outline" onClick={fetchKpiData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="user">User Metrics</TabsTrigger>
          <TabsTrigger value="all">All KPIs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <KpiSection title="Revenue Metrics" isLoading={loading} />
            
            {loading ? (
              <Card className="col-span-3">
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            ) : (
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={prepareChartData(kpisByCategory['revenue'] || [])}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="marketing">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : kpisByCategory['marketing']?.length > 0 ? (
              kpisByCategory['marketing'].map(kpi => (
                <Card key={kpi.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{kpi.name}</CardTitle>
                      <Badge variant="outline">{kpi.source}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{kpi.value.toLocaleString()}</div>
                    {kpi.previous_value !== null && (
                      <div className="flex items-center">
                        <Badge variant={calculateTrend(kpi.value, kpi.previous_value) >= 0 ? "success" : "destructive"}>
                          {calculateTrend(kpi.value, kpi.previous_value).toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-muted-foreground ml-2">vs previous period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground">No marketing KPI data available</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="user">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : kpisByCategory['user']?.length > 0 ? (
              kpisByCategory['user'].map(kpi => (
                <Card key={kpi.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{kpi.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{kpi.value.toLocaleString()}</div>
                    {kpi.previous_value !== null && (
                      <div className="flex items-center">
                        <Badge variant={calculateTrend(kpi.value, kpi.previous_value) >= 0 ? "success" : "destructive"}>
                          {calculateTrend(kpi.value, kpi.previous_value).toFixed(1)}%
                        </Badge>
                        <span className="text-sm text-muted-foreground ml-2">vs previous period</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground">No user KPI data available</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>All KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                ) : kpiData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Value</th>
                          <th className="text-left p-2">Previous</th>
                          <th className="text-left p-2">Change</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiData.map(kpi => (
                          <tr key={kpi.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{kpi.name}</td>
                            <td className="p-2">{kpi.category || 'N/A'}</td>
                            <td className="p-2">{kpi.value.toLocaleString()}</td>
                            <td className="p-2">{kpi.previous_value?.toLocaleString() || 'N/A'}</td>
                            <td className="p-2">
                              {kpi.previous_value !== null && (
                                <Badge variant={calculateTrend(kpi.value, kpi.previous_value) >= 0 ? "success" : "destructive"}>
                                  {calculateTrend(kpi.value, kpi.previous_value).toFixed(1)}%
                                </Badge>
                              )}
                            </td>
                            <td className="p-2">{new Date(kpi.date).toLocaleDateString()}</td>
                            <td className="p-2">{kpi.source || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No KPI data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpiDashboard;
