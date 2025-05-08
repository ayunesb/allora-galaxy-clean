
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentEvolutionTab } from './AgentEvolutionTab';
import { PluginEvolutionTab } from './PluginEvolutionTab';
import { StrategyEvolutionTab } from './StrategyEvolutionTab';
import { AuditLog } from './AuditLog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Timeline, GitBranch, GitMerge, GitPullRequest, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const EvolutionDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('agents');

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Evolution Dashboard</h1>
        <p className="text-muted-foreground">
          Track and manage the evolution of your agents, plugins, and strategies over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agent Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">+12 in last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Evolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21%</div>
            <p className="text-xs text-muted-foreground mt-1">+3% from previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground mt-1">SOC2 compliant</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+34%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across all agents</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Agent Evolution
            </TabsTrigger>
            <TabsTrigger value="plugins" className="flex items-center gap-2">
              <GitPullRequest className="h-4 w-4" />
              Plugin Evolution
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Strategy Evolution
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Timeline className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="agents" className="space-y-4">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-4">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-4">
          <StrategyEvolutionTab />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <AuditLog />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            <CardTitle>Enterprise Compliance</CardTitle>
          </div>
          <CardDescription>
            SOC2-style traceability for AI decision-making and evolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This dashboard provides complete visibility into how your AI agents, plugins, and strategies evolve over time, 
            with full audit capabilities to track and roll back changes as needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-sm">Change Tracking</span>
              <span className="text-sm text-muted-foreground">
                Every prompt evolution is versioned and tracked
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-sm">Decision Diffing</span>
              <span className="text-sm text-muted-foreground">
                Compare decisions and logic changes
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-sm">SOC2 Compliance</span>
              <span className="text-sm text-muted-foreground">
                Complete audit trails for enterprise requirements
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
