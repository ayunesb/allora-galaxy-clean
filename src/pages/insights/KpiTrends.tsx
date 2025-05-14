
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import PageHelmet from '@/components/PageHelmet';

const KpiTrends: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  // Fetch trend data
  useEffect(() => {
    const fetchData = async () => {
      if (currentWorkspace?.id) {
        setIsLoading(true);
        try {
          const data = await fetchKpiTrends(currentWorkspace.id);
          setTrendData(data || []);
        } catch (err) {
          console.error('Error fetching KPI trends:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [currentWorkspace?.id, timeRange]);
  
  // Find MRR trend data if it exists
  const mrrData = trendData.find(d => d.name === 'mrr');
  
  // Find lead conversion trend data if it exists
  const conversionData = trendData.find(d => d.name === 'lead_conversion');

  // Extract months array from data if it exists
  const months = mrrData?.months || [];

  // Create chart data from trends
  const createChartData = (trend: any) => {
    if (!trend || !trend.history || !trend.months) return [];
    
    return trend.history.map((value: number, index: number) => ({
      month: trend.months[index],
      value: value
    }));
  };
  
  // Create multiple trend chart data
  const createMultiTrendData = () => {
    if (!mrrData?.months) return [];
    
    return mrrData.months.map((month: string, index: number) => {
      const dataPoint: any = { month };
      
      trendData.forEach(trend => {
        if (trend.history && trend.history[index] !== undefined) {
          dataPoint[trend.name] = trend.history[index];
        }
      });
      
      return dataPoint;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="KPI Trends"
        description="Visualize your key performance indicators over time"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">KPI Trends</h1>
          <p className="text-muted-foreground mt-2">
            Analyze your performance metrics over time
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="year">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="mrr">
        <TabsList className="mb-4">
          <TabsTrigger value="mrr">MRR</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
          <TabsTrigger value="visitors">Website Visitors</TabsTrigger>
          <TabsTrigger value="all">All Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mrr">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Recurring Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-md" />
              ) : mrrData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={createChartData(mrrData)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="value" name="MRR" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">No MRR data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-md" />
              ) : conversionData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={createChartData(conversionData)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Conversion Rate" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">No conversion data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visitors">
          <Card>
            <CardHeader>
              <CardTitle>Website Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-md" />
              ) : trendData.find(d => d.name === 'website_visitors') ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart 
                    data={createChartData(trendData.find(d => d.name === 'website_visitors'))} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Visitors" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">No visitor data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All KPI Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-md" />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart 
                    data={createMultiTrendData()} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    {trendData.map((trend, index) => (
                      <Line
                        key={trend.name}
                        type="monotone"
                        dataKey={trend.name}
                        name={trend.name.replace('_', ' ').toUpperCase()}
                        stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][index % 4]}
                        activeDot={{ r: 8 }}
                        yAxisId={trend.name === 'mrr' ? 'right' : 'left'}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">No KPI data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpiTrends;
