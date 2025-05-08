
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import KpiSection from '@/components/dashboard/KpiSection';
import StrategyCard from '@/components/strategy/StrategyCard';
import { fetchStrategies } from '@/services/strategyService';
import PageHelmet from '@/components/PageHelmet';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { StrategiesGrid } from '@/components/dashboard/StrategyGrid';
import { CheckCircle, Clock, CalendarIcon } from 'lucide-react';

interface DashboardProps {}

interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  tags: string[];
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { tenant } = useWorkspace();

  // Fetch strategies
  const { data: strategies = [], isLoading: isLoadingStrategies } = useQuery({
    queryKey: ['strategies', tenant?.id],
    queryFn: () => fetchStrategies(tenant?.id),
    enabled: !!tenant?.id
  });

  // Filter strategies by status
  const approvedStrategies = strategies.filter((s: Strategy) => s.status === 'approved');
  const pendingStrategies = strategies.filter((s: Strategy) => s.status === 'pending');
  const draftStrategies = strategies.filter((s: Strategy) => s.status === 'draft');

  return (
    <>
      <PageHelmet 
        title="Dashboard" 
        description="Allora OS - Your AI-native business operating system" 
      />
      
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business operations and key metrics
          </p>
        </div>
        
        {/* KPI Section */}
        <KpiSection 
          title="Key Performance Indicators" 
          isLoading={false}
          kpiData={[
            { name: 'Total Strategies', value: strategies.length },
            { name: 'Approved Strategies', value: approvedStrategies.length },
            { name: 'Pending Strategies', value: pendingStrategies.length }
          ]}
        />
        
        {/* Strategies Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Strategies</h2>
          </div>
          
          <Tabs defaultValue="approved" className="w-full">
            <TabsList>
              <TabsTrigger value="approved" className="flex gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Approved</span> 
                <span className="ml-1 rounded-full bg-primary/10 px-2 text-xs">
                  {approvedStrategies.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex gap-2">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
                <span className="ml-1 rounded-full bg-primary/10 px-2 text-xs">
                  {pendingStrategies.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Draft</span>
                <span className="ml-1 rounded-full bg-primary/10 px-2 text-xs">
                  {draftStrategies.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="approved">
              <StrategiesGrid isLoading={isLoadingStrategies} strategies={approvedStrategies}>
                {approvedStrategies.map((strategy: Strategy) => (
                  <StrategyCard 
                    key={strategy.id}
                    title={strategy.title}
                    description={strategy.description}
                    status={strategy.status as 'approved' | 'pending' | 'rejected'}
                    createdAt={strategy.created_at}
                    tags={strategy.tags}
                    onView={() => {}}
                    onLaunch={() => {}}
                  />
                ))}
              </StrategiesGrid>
            </TabsContent>
            
            <TabsContent value="pending">
              <StrategiesGrid isLoading={isLoadingStrategies} strategies={pendingStrategies}>
                {pendingStrategies.map((strategy: Strategy) => (
                  <StrategyCard 
                    key={strategy.id}
                    title={strategy.title}
                    description={strategy.description}
                    status={strategy.status as 'approved' | 'pending' | 'rejected'}
                    createdAt={strategy.created_at}
                    tags={strategy.tags}
                    onView={() => {}}
                  />
                ))}
              </StrategiesGrid>
            </TabsContent>
            
            <TabsContent value="draft">
              <StrategiesGrid isLoading={isLoadingStrategies} strategies={draftStrategies}>
                {draftStrategies.map((strategy: Strategy) => (
                  <StrategyCard 
                    key={strategy.id}
                    title={strategy.title}
                    description={strategy.description}
                    status={strategy.status as 'approved' | 'pending' | 'rejected'}
                    createdAt={strategy.created_at}
                    tags={strategy.tags}
                    onView={() => {}}
                  />
                ))}
              </StrategiesGrid>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
