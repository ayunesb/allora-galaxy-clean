import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHelmet from '@/components/PageHelmet';
import KPICard from '@/components/KPICard';
import { KPICardSkeleton } from '@/components/skeletons/KPICardSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useQuery } from '@tanstack/react-query';
import { KPI, KPICategory, KPISource } from '@/types/fixed';

// Define categories for filtering
const categories = ['All', 'Financial', 'Marketing', 'Sales', 'Product'];

// Define a type for the trend data
type KpiTrendData = {
  date: string;
  value: number;
};

// Component for KPI Dashboard
const KpiDashboard: React.FC = () => {
  const tenantId = useTenantId();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<KpiTrendData[]>([]);

  // Query to fetch KPIs
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['kpis', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('tenant_id', tenantId);
        
      if (error) throw error;
      
      // Transform from snake_case to camelCase
      return data.map((kpi: any) => ({
        id: kpi.id,
        tenantId: kpi.tenant_id,
        name: kpi.name,
        value: kpi.value,
        previousValue: kpi.previous_value,
        source: kpi.source,
        category: kpi.category,
        date: kpi.date,
        createdAt: kpi.created_at,
        updatedAt: kpi.updated_at
      })) as KPI[];
    },
    enabled: !!tenantId
  });

  // Filter KPIs based on selected category
  const filteredKpis = React.useMemo(() => {
    if (!kpis) return [];
    if (selectedCategory === 'All') return kpis;
    return kpis.filter(kpi => 
      kpi.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [kpis, selectedCategory]);

  // Fetch trend data for selected KPI
  useEffect(() => {
    const fetchTrendData = async () => {
      if (!selectedKpi || !tenantId) return;
      
      // Typically you would fetch historical data here
      // For now we'll generate mock data
      const mockTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 100) + 50
        };
      });
      
      setTrendData(mockTrend);
    };

    fetchTrendData();
  }, [selectedKpi, tenantId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="KPI Dashboard"
        description="Track your key performance indicators"
      />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <p className="text-muted-foreground">Track your organization's key metrics in real-time</p>
      </div>
      
      <Tabs defaultValue="All" className="mb-6">
        <TabsList>
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? 
          Array(3).fill(0).map((_, i) => <KPICardSkeleton key={i} />) :
          
          filteredKpis.length > 0 ? (
            filteredKpis.map(kpi => (
              <KPICard
                key={kpi.id}
                name={kpi.name}
                value={kpi.value}
                previousValue={kpi.previousValue}
                category={kpi.category as KPICategory}
                source={kpi.source as KPISource}
                format={kpi.category === 'financial' ? 'currency' : 'number'}
                trendData={selectedKpi === kpi.id ? trendData : undefined}
              />
            ))
          ) : (
            <div className="col-span-3 p-8 text-center border rounded-lg">
              <h3 className="mb-2 text-lg font-medium">No KPIs found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory === 'All' 
                  ? "You don't have any KPIs yet." 
                  : `No ${selectedCategory} KPIs found.`}
              </p>
              <Button>Add KPI</Button>
            </div>
          )
        }
      </div>

      {selectedKpi && trendData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Trend Analysis</span>
              <Badge variant="outline">
                {filteredKpis.find(k => k.id === selectedKpi)?.name || 'KPI Trend'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KpiDashboard;
