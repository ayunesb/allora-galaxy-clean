
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const AiDecisions = () => {
  const { tenant } = useWorkspace();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">AI Decisions</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Decisions</h1>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Decisions</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="agents">Agent Evolution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              This dashboard will show AI decisions across your workspace.
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategies" className="mt-6">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Strategy-related AI decisions will appear here.
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins" className="mt-6">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Plugin-related AI decisions will appear here.
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents" className="mt-6">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Agent evolution decisions will appear here.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiDecisions;
