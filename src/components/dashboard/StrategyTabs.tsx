import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, LineChart, Settings, History } from 'lucide-react';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';

interface Strategy {
  id: string;
  name: string;
  description: string;
  created_at: string;
  status: string;
}

interface StrategyTabsProps {
  strategies: Strategy[];
  isLoading: boolean;
  error: any;
  onNewStrategy: () => void;
  onEditStrategy: (id: string) => void;
  onRunStrategy: (id: string) => void;
}

const StrategyTabs: React.FC<StrategyTabsProps> = ({
  strategies,
  isLoading,
  error,
  onNewStrategy,
  onEditStrategy,
  onRunStrategy
}) => {
  const [activeTab, setActiveTab] = useState("active");

  // Filter strategies based on active tab
  const filteredStrategies = strategies.filter(strategy => {
    if (activeTab === "active") return strategy.status === "active";
    if (activeTab === "draft") return strategy.status === "draft";
    if (activeTab === "archived") return strategy.status === "archived";
    return true;
  });

  return (
    <EdgeFunctionHandler
      isLoading={isLoading}
      error={error}
    >
      <Tabs 
        defaultValue="active" 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          
          <Button onClick={onNewStrategy} className="gap-2">
            <PlusCircle size={16} /> New Strategy
          </Button>
        </div>

        <TabsContent value="active" className="m-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.length === 0 ? (
              <EmptyState 
                message="No active strategies yet"
                description="Start by creating a new strategy"
                action={onNewStrategy}
                actionLabel="Create Strategy"
              />
            ) : (
              filteredStrategies.map(strategy => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onEdit={() => onEditStrategy(strategy.id)}
                  onRun={() => onRunStrategy(strategy.id)}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="draft" className="m-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.length === 0 ? (
              <EmptyState 
                message="No draft strategies"
                description="Drafts are strategies that are still in development"
                action={onNewStrategy}
                actionLabel="Create Draft"
              />
            ) : (
              filteredStrategies.map(strategy => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onEdit={() => onEditStrategy(strategy.id)}
                  onRun={() => onRunStrategy(strategy.id)}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="archived" className="m-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.length === 0 ? (
              <EmptyState 
                message="No archived strategies"
                description="Archived strategies are no longer active but preserved for reference"
              />
            ) : (
              filteredStrategies.map(strategy => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onEdit={() => onEditStrategy(strategy.id)}
                  onRun={() => onRunStrategy(strategy.id)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </EdgeFunctionHandler>
  );
};

interface StrategyCardProps {
  strategy: Strategy;
  onEdit: () => void;
  onRun: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onEdit, onRun }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{strategy.name || "Unnamed Strategy"}</CardTitle>
        <CardDescription className="line-clamp-2">
          {strategy.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Status: {strategy.status || "unknown"}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Settings className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" onClick={onRun}>
              <LineChart className="h-4 w-4 mr-1" /> Run
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  description, 
  action, 
  actionLabel 
}) => (
  <Card className="col-span-full p-8 flex flex-col items-center justify-center text-center">
    <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
      <History className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="font-medium text-lg">{message}</h3>
    {description && <p className="text-muted-foreground mt-1">{description}</p>}
    {action && actionLabel && (
      <Button onClick={action} className="mt-4">
        {actionLabel}
      </Button>
    )}
  </Card>
);

export default StrategyTabs;
