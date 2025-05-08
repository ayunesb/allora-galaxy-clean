
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { KpiSection } from '@/components/dashboard/KpiSection';
import { StrategyTabs } from '@/components/dashboard/StrategyTabs';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { tenant } = useWorkspace();
  const { strategies, kpiData, isLoading } = useDashboardData(tenant?.id);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <KpiSection kpiData={kpiData} isLoading={isLoading} />
      
      <StrategyTabs strategies={strategies} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
