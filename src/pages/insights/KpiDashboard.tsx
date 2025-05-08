
// Fix unused imports and implicitly any parameter
import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import KPICard from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { KPITrend } from '@/types/shared';

// Define KpiTrendData type
interface KpiTrendData {
  mrr: KPITrend[];
  visitors: KPITrend[];
  leads: KPITrend[];
  customers: KPITrend[];
}

export default function KpiDashboard() {
  const { currentTenant } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KpiTrendData>({
    mrr: [],
    visitors: [],
    leads: [],
    customers: [],
  });

  useEffect(() => {
    if (currentTenant?.id) {
      loadKpiData();
    }
  }, [currentTenant?.id]);

  const loadKpiData = async () => {
    try {
      setIsLoading(true);
      if (!currentTenant?.id) return;

      const trends = await fetchKpiTrends(currentTenant.id);
      setKpiData(trends);
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadKpiData();
  };

  const groupByCategory = (trends: KPITrend[]) => {
    return trends.reduce((acc: Record<string, KPITrend[]>, trend) => {
      if (!acc[trend.category]) {
        acc[trend.category] = [];
      }
      acc[trend.category].push(trend);
      return acc;
    }, {});
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* MRR Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Recurring Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-32" />)
            : kpiData.mrr.map((kpi) => <KPICard key={kpi.id} data={kpi} />)}
        </div>
      </section>

      {/* Website Traffic Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Website Traffic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={`visitor-${i}`} className="h-32" />)
            : kpiData.visitors.map((kpi) => <KPICard key={kpi.id} data={kpi} />)}
        </div>
      </section>

      {/* Lead Generation Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Lead Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={`lead-${i}`} className="h-32" />)
            : kpiData.leads.map((kpi) => <KPICard key={kpi.id} data={kpi} />)}
        </div>
      </section>

      {/* Customer Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Customer Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={`customer-${i}`} className="h-32" />)
            : kpiData.customers.map((kpi) => <KPICard key={kpi.id} data={kpi} />)}
        </div>
      </section>
    </div>
  );
}
