
import React from 'react';
import { Strategy } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StrategyCard } from '@/components/dashboard/StrategyCard';

interface StrategyTabsProps {
  strategies: Strategy[];
  isLoading: boolean;
}

export const StrategyTabs: React.FC<StrategyTabsProps> = ({
  strategies,
  isLoading
}) => {
  return (
    <Tabs defaultValue="all" className="mt-8">
      <TabsList>
        <TabsTrigger value="all">All Strategies</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <p>Loading strategies...</p>
          ) : strategies.length > 0 ? (
            strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                id={strategy.id}
                title={strategy.title}
                description={strategy.description}
                status={strategy.status === 'approved' ? 'active' : 
                       strategy.status === 'in_progress' ? 'active' :
                       strategy.status === 'rejected' ? 'archived' : 
                       strategy.status === 'completed' ? 'completed' : 'pending'}
                priority={strategy.priority as 'high' | 'medium' | 'low' | undefined}
                completionPercentage={strategy.completion_percentage || 0}
                createdBy={strategy.created_by === 'ai' ? 'ai' : 'human'}
                tags={strategy.tags || []}
              />
            ))
          ) : (
            <Card className="p-6 text-center col-span-full">
              <p className="text-muted-foreground mb-4">No strategies found</p>
              <Button asChild>
                <a href="/launch">Create Strategy</a>
              </Button>
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="pending" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <p>Loading strategies...</p>
          ) : strategies.filter(s => s.status === 'pending').length > 0 ? (
            strategies
              .filter(s => s.status === 'pending')
              .map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  id={strategy.id}
                  title={strategy.title}
                  description={strategy.description}
                  status="pending"
                  priority={strategy.priority as 'high' | 'medium' | 'low' | undefined}
                  completionPercentage={strategy.completion_percentage || 0}
                  createdBy={strategy.created_by === 'ai' ? 'ai' : 'human'}
                  tags={strategy.tags || []}
                />
              ))
          ) : (
            <Card className="p-6 text-center col-span-full">
              <p className="text-muted-foreground">No pending strategies</p>
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="active" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <p>Loading strategies...</p>
          ) : strategies.filter(s => s.status === 'approved' || s.status === 'in_progress').length > 0 ? (
            strategies
              .filter(s => s.status === 'approved' || s.status === 'in_progress')
              .map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  id={strategy.id}
                  title={strategy.title}
                  description={strategy.description}
                  status="active"
                  priority={strategy.priority as 'high' | 'medium' | 'low' | undefined}
                  completionPercentage={strategy.completion_percentage || 0}
                  createdBy={strategy.created_by === 'ai' ? 'ai' : 'human'}
                  tags={strategy.tags || []}
                />
              ))
          ) : (
            <Card className="p-6 text-center col-span-full">
              <p className="text-muted-foreground">No active strategies</p>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
