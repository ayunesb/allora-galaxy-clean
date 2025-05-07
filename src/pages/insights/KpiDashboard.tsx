
import React, { useEffect, useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchLatestKpis } from '@/lib/kpi/fetchKpiTrends';
import { getTrendDirection, formatTrendPercentage } from '@/lib/kpi/analyzeTrends';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/KPICard';
import PageHelmet from '@/components/PageHelmet';
import { Loader2, PieChart, DollarSign, Users, TrendingUp } from 'lucide-react';

// KPI types
type KPICategory = 'financial' | 'marketing' | 'sales' | 'product';
type KPISource = 'stripe' | 'ga4' | 'hubspot' | 'manual' | 'calculated';

interface KPI {
  id: string;
  title: string;
  value: string;
  previousValue?: number;
  category: KPICategory;
  source: KPISource;
  format: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
}

interface KpiTrendData {
  date: string;
  value: number;
}

const KpiDashboard: React.FC = () => {
  const { currentTenant } = useWorkspace();
  const [activeTab, setActiveTab] = useState<KPICategory>('financial');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadKpis = async () => {
      if (!currentTenant?.id) return;
      
      setLoading(true);
      
      try {
        const latestKpis = await fetchLatestKpis(currentTenant.id, activeTab);
        
        const formattedKpis: KPI[] = latestKpis.map((kpi: any) => {
          const originalDirection = getTrendDirection(kpi);
          // Convert from 'positive'/'negative'/'neutral' to 'up'/'down'/'neutral'
          const trendDirection: 'up' | 'down' | 'neutral' = 
            originalDirection === 'positive' ? 'up' : 
            originalDirection === 'negative' ? 'down' : 'neutral';
            
          return {
            id: kpi.id,
            title: kpi.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            value: formatKpiValue(kpi.value, kpi.name),
            previousValue: kpi.previous_value,
            category: kpi.category || 'financial',
            source: kpi.source || 'calculated',
            format: getKpiFormat(kpi.name),
            trend: kpi.previous_value ? ((kpi.value - kpi.previous_value) / kpi.previous_value) * 100 : undefined,
            trendDirection
          };
        });
        
        setKpis(formattedKpis);
      } catch (error) {
        console.error("Error loading KPIs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadKpis();
  }, [currentTenant?.id, activeTab]);

  const formatKpiValue = (value: number, name: string): string => {
    if (name.includes('revenue') || name.includes('mrr') || name.includes('arr')) {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0 
      }).format(value);
    }
    
    if (name.includes('percentage') || name.includes('rate')) {
      return `${value.toFixed(1)}%`;
    }
    
    if (value > 1000) {
      return value.toLocaleString();
    }
    
    return value.toString();
  };
  
  const getKpiFormat = (name: string): string => {
    if (name.includes('revenue') || name.includes('mrr') || name.includes('arr')) {
      return 'currency';
    }
    
    if (name.includes('percentage') || name.includes('rate')) {
      return 'percentage';
    }
    
    return 'number';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="KPI Dashboard" 
        description="Track your business performance metrics"
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <p className="text-muted-foreground">Track your key performance indicators across the business</p>
      </div>
      
      <Tabs defaultValue="financial" value={activeTab} onValueChange={(value) => setActiveTab(value as KPICategory)}>
        <TabsList className="mb-6">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <TabsContent value={activeTab} className="mt-0">
            {kpis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.map(kpi => (
                  <KPICard
                    key={kpi.id}
                    title={kpi.title}
                    value={kpi.value}
                    previousValue={kpi.previousValue}
                    trend={kpi.trend}
                    trendDirection={kpi.trendDirection}
                    icon={getKpiIcon(kpi.title)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-xl font-medium mb-2">No KPIs found</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    There are no KPIs available for this category yet. They will appear here once data is collected.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Helper function to get the appropriate icon for a KPI
const getKpiIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('revenue') || lowerTitle.includes('mrr') || lowerTitle.includes('arr') || lowerTitle.includes('cost')) {
    return <DollarSign className="h-4 w-4" />;
  }
  
  if (lowerTitle.includes('user') || lowerTitle.includes('customer') || lowerTitle.includes('lead')) {
    return <Users className="h-4 w-4" />;
  }
  
  if (lowerTitle.includes('conversion') || lowerTitle.includes('growth') || lowerTitle.includes('rate')) {
    return <TrendingUp className="h-4 w-4" />;
  }
  
  return <PieChart className="h-4 w-4" />;
};

export default KpiDashboard;
