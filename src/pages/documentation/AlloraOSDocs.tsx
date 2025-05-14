
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHelmet from '@/components/PageHelmet';
import {
  OverviewSection,
  GettingStartedSection,
  StrategiesSection,
  PluginsSection,
  AgentsSection,
  ApiSection
} from '@/components/documentation/sections';

const AlloraOSDocs: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      <PageHelmet title="Documentation" description="Allora OS documentation and guides" />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Allora OS Documentation</h1>
        <p className="text-muted-foreground">
          Comprehensive guides and documentation for the Allora OS platform
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 h-auto p-1">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="getting-started" className="py-2">Getting Started</TabsTrigger>
          <TabsTrigger value="strategies" className="py-2">Strategies</TabsTrigger>
          <TabsTrigger value="plugins" className="py-2">Plugins</TabsTrigger>
          <TabsTrigger value="agents" className="py-2">Agents</TabsTrigger>
          <TabsTrigger value="api" className="py-2">API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <OverviewSection />
        </TabsContent>
        
        <TabsContent value="getting-started" className="space-y-6">
          <GettingStartedSection />
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-6">
          <StrategiesSection />
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-6">
          <PluginsSection />
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-6">
          <AgentsSection />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <ApiSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlloraOSDocs;
