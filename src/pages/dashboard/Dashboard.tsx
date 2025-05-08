
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { fetchKpiTrends } from '@/lib/kpi/fetchKpiTrends';
import { KPICard } from '@/components/KPICard';
import { StrategyCard } from '@/components/dashboard/StrategyCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockStrategies } from '@/lib/__mocks__/mockStrategies';
import { type KpiTrendPoint } from '@/types/shared';

const Dashboard = () => {
  const { tenant, loading } = useWorkspace();
  const [kpiTrends, setKpiTrends] = useState<KpiTrendPoint[]>([]);
  const [strategies, setStrategies] = useState(mockStrategies);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadKpis = async () => {
      if (tenant?.id) {
        try {
          setLoadingKpis(true);
          const data = await fetchKpiTrends(tenant.id);
          setKpiTrends(data);
        } catch (error) {
          console.error('Error loading KPIs:', error);
        } finally {
          setLoadingKpis(false);
        }
      }
    };

    loadKpis();
  }, [tenant?.id]);

  const handleLaunchStrategy = async (id: string) => {
    try {
      // Navigate to launch page with selected strategy
      navigate(`/launch?strategy=${id}`);
    } catch (error) {
      console.error('Error launching strategy:', error);
    }
  };

  // Filter strategies to show only pending ones
  const pendingStrategies = strategies.filter(s => s.status === 'pending');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-1/3 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const renderKpiCards = () => {
    if (loadingKpis) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (kpiTrends.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No KPI data available.</p>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiTrends.map((kpi) => (
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
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
      {renderKpiCards()}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Strategies Pending Approval</h2>
        <Button onClick={() => navigate('/launch')}>
          <Plus className="h-4 w-4 mr-2" /> Create Strategy
        </Button>
      </div>
      
      {pendingStrategies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingStrategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              id={strategy.id}
              title={strategy.title}
              description={strategy.description}
              status={strategy.status}
              priority={strategy.priority}
              tags={strategy.tags}
              dueDate={strategy.due_date}
              createdBy={strategy.created_by || null}
              completionPercentage={strategy.completion_percentage}
              onLaunch={handleLaunchStrategy}
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No strategies pending approval.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/launch')} 
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" /> Create your first strategy
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
