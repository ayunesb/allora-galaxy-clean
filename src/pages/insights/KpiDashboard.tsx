
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendDirection } from '@/types/shared';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { KPICardSkeleton } from '@/components/skeletons/KPICardSkeleton';

interface KpiData {
  name: string;
  date: string;
  value: number;
  previousValue: number;
  trend?: number;
}

const KpiDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useWorkspace();

  useEffect(() => {
    if (tenant?.id) {
      fetchKpiData(tenant.id);
    }
  }, [tenant]);

  const fetchKpiData = async (tenantId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would fetch from Supabase
      // For demo, use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock KPI data
      const mockKpis: KpiData[] = [
        {
          name: 'mrr',
          date: '2025-05-01',
          value: 12500,
          previousValue: 10000,
          trend: 25
        },
        {
          name: 'lead_conversion',
          date: '2025-05-01',
          value: 4.8,
          previousValue: 3.5,
          trend: 37.1
        },
        {
          name: 'website_visitors',
          date: '2025-05-01',
          value: 25400,
          previousValue: 18900,
          trend: 34.4
        },
        {
          name: 'social_engagement',
          date: '2025-05-01',
          value: 1250,
          previousValue: 950,
          trend: 31.6
        }
      ];
      
      // Mock historical data for chart
      const mockHistoricalData = [
        { month: 'Jan', mrr: 5000, visitors: 10000 },
        { month: 'Feb', mrr: 6200, visitors: 12000 },
        { month: 'Mar', mrr: 7500, visitors: 14500 },
        { month: 'Apr', mrr: 10000, visitors: 18900 },
        { month: 'May', mrr: 12500, visitors: 25400 }
      ];
      
      setKpis(mockKpis);
      setHistoricalData(mockHistoricalData);
    } catch (err: any) {
      console.error('Error fetching KPI data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine trend direction from percentage
  const getTrendDirection = (trendPercentage: number): TrendDirection => {
    if (trendPercentage > 0) return 'up';
    if (trendPercentage < 0) return 'down';
    return 'flat';
  };

  if (error) {
    return (
      <div className="container py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="text-red-800">Error loading KPI data: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">KPI Dashboard</h1>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          <>
            {/* MRR KPI Card */}
            <KPICard
              title="Monthly Recurring Revenue"
              value={`$${kpis.find(k => k.name === 'mrr')?.value.toLocaleString() || 0}`}
              trend={kpis.find(k => k.name === 'mrr')?.trend}
              trendDirection={getTrendDirection(kpis.find(k => k.name === 'mrr')?.trend || 0)}
            />
            
            {/* Lead Conversion KPI Card */}
            <KPICard
              title="Lead Conversion"
              value={`${kpis.find(k => k.name === 'lead_conversion')?.value.toFixed(1) || 0}%`}
              trend={kpis.find(k => k.name === 'lead_conversion')?.trend}
              trendDirection={getTrendDirection(kpis.find(k => k.name === 'lead_conversion')?.trend || 0)}
            />
            
            {/* Website Visitors KPI Card */}
            <KPICard
              title="Website Visitors"
              value={(kpis.find(k => k.name === 'website_visitors')?.value || 0).toLocaleString()}
              trend={kpis.find(k => k.name === 'website_visitors')?.trend}
              trendDirection={getTrendDirection(kpis.find(k => k.name === 'website_visitors')?.trend || 0)}
            />
            
            {/* Social Engagement KPI Card */}
            <KPICard
              title="Social Engagement"
              value={(kpis.find(k => k.name === 'social_engagement')?.value || 0).toLocaleString()}
              trend={kpis.find(k => k.name === 'social_engagement')?.trend}
              trendDirection={getTrendDirection(kpis.find(k => k.name === 'social_engagement')?.trend || 0)}
            />
          </>
        )}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>MRR Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Website Traffic</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => (value as number).toLocaleString()} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiDashboard;
