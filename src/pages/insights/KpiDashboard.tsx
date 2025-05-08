
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { KPICard } from '@/components/KPICard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { type KpiTrendPoint } from '@/types/shared';

interface KpiTrendData {
  finance: KpiTrendPoint[];
  marketing: KpiTrendPoint[];
  sales: KpiTrendPoint[];
  operations: KpiTrendPoint[];
}

const KpiDashboard = () => {
  const { tenant, loading } = useWorkspace();
  const [kpiData, setKpiData] = useState<KpiTrendData>({
    finance: [],
    marketing: [],
    sales: [],
    operations: []
  });
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadKpis = async () => {
      if (tenant?.id) {
        try {
          setLoadingKpis(true);
          const data = await fetchKpiTrends(tenant.id);
          
          // Group KPIs by category
          const grouped = data.reduce((acc: KpiTrendData, kpi) => {
            const category = kpi.category?.toLowerCase() || 'finance';
            if (!acc[category as keyof KpiTrendData]) {
              acc[category as keyof KpiTrendData] = [];
            }
            acc[category as keyof KpiTrendData].push(kpi);
            return acc;
          }, {
            finance: [],
            marketing: [],
            sales: [],
            operations: []
          });
          
          setKpiData(grouped);
        } catch (error) {
          console.error('Error loading KPIs:', error);
        } finally {
          setLoadingKpis(false);
        }
      }
    };

    loadKpis();
  }, [tenant?.id]);

  // Get all KPIs combined
  const allKpis = [
    ...kpiData.finance,
    ...kpiData.marketing,
    ...kpiData.sales,
    ...kpiData.operations
  ];

  if (loading || loadingKpis) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-1/3 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">KPI Dashboard</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All KPIs</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {allKpis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allKpis.map((kpi) => (
                <KPICard 
                  key={kpi.id} 
                  id={kpi.id}
                  name={kpi.name}
                  value={kpi.value}
                  previousValue={kpi.previousValue}
                  percentChange={kpi.percentChange}
                  trend={kpi.direction}
                  positive={kpi.isPositive}
                  unit={kpi.unit}
                  category={kpi.category}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No KPI data available.</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="finance">
          {kpiData.finance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kpiData.finance.map((kpi) => (
                <KPICard 
                  key={kpi.id} 
                  id={kpi.id}
                  name={kpi.name}
                  value={kpi.value}
                  previousValue={kpi.previousValue}
                  percentChange={kpi.percentChange}
                  trend={kpi.direction}
                  positive={kpi.isPositive}
                  unit={kpi.unit}
                  category={kpi.category}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No finance KPIs available.</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="marketing">
          {kpiData.marketing.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kpiData.marketing.map((kpi) => (
                <KPICard 
                  key={kpi.id} 
                  id={kpi.id}
                  name={kpi.name}
                  value={kpi.value}
                  previousValue={kpi.previousValue}
                  percentChange={kpi.percentChange}
                  trend={kpi.direction}
                  positive={kpi.isPositive}
                  unit={kpi.unit}
                  category={kpi.category}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No marketing KPIs available.</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sales">
          {kpiData.sales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kpiData.sales.map((kpi) => (
                <KPICard 
                  key={kpi.id} 
                  id={kpi.id}
                  name={kpi.name}
                  value={kpi.value}
                  previousValue={kpi.previousValue}
                  percentChange={kpi.percentChange}
                  trend={kpi.direction}
                  positive={kpi.isPositive}
                  unit={kpi.unit}
                  category={kpi.category}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No sales KPIs available.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KpiDashboard;
