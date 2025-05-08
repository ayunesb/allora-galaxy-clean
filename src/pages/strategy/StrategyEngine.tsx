import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { runStrategy } from '@/lib/strategy/runStrategy';

import StrategyHeader from '@/components/strategy/StrategyHeader';
import StrategyActions from '@/components/strategy/StrategyActions';
import StrategyDescription from '@/components/strategy/StrategyDescription';
import StrategyMetadata from '@/components/strategy/StrategyMetadata';
import StrategyTags from '@/components/strategy/StrategyTags';

interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by: string | null;
  tenant_id: string;
  tags: string[];
  plugins: string[];
}

const StrategyEngine = () => {
  const { id } = useParams<{ id: string }>();
  const { tenant } = useWorkspace();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (tenant?.id && id) {
      fetchStrategyDetails();
    }
  }, [id, tenant?.id]);
  
  const fetchStrategyDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenant?.id)
        .single();
      
      if (error) throw error;
      
      setStrategy(data);
    } catch (err) {
      console.error('Error fetching strategy details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load strategy details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/launch');
  };
  
  const executeStrategy = async () => {
    if (!strategy || !tenant?.id) return;
    
    setIsExecuting(true);
    toast({
      title: 'Executing Strategy',
      description: 'The strategy execution has started...',
    });
    
    try {
      const result = await runStrategy({
        strategyId: strategy.id,
        tenantId: tenant.id,
      });
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Strategy executed successfully!',
          variant: 'default',
        });
        
        // Refresh strategy details to show updated status
        fetchStrategyDetails();
      } else {
        toast({
          title: 'Execution Failed',
          description: result.error || 'Strategy execution failed.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Error executing strategy:', err);
      toast({
        title: 'Execution Error',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!strategy) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold mb-2">Strategy Not Found</h2>
            <p className="text-muted-foreground mb-4">The strategy you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={handleBack}>Back to Strategies</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const status = (strategy?.status || 'pending') as "pending" | "completed" | "approved" | "rejected" | "in_progress" | "draft";
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <StrategyHeader 
        status={status} 
        title={strategy.title} 
        onBack={handleBack} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StrategyDescription description={strategy.description} />
          
          <Tabs defaultValue="plugins" className="w-full">
            <TabsList>
              <TabsTrigger value="plugins">Plugins</TabsTrigger>
              <TabsTrigger value="execution">Execution History</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plugins" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Plugins</CardTitle>
                </CardHeader>
                <CardContent>
                  {strategy.plugins && strategy.plugins.length > 0 ? (
                    <div className="space-y-4">
                      <p>The strategy uses {strategy.plugins.length} plugins.</p>
                      {/* Plugin list would go here */}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No plugins associated with this strategy.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="execution" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Execution history will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="config" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Strategy configuration options will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <StrategyActions 
            strategyId={id || ''} 
            onExecute={executeStrategy} 
            isExecuting={isExecuting}
            status={status}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <StrategyMetadata
                createdBy={strategy?.created_by || ''}
                approvedBy={strategy?.approved_by || null}
                createdAt={strategy?.created_at || ''}
                updatedAt={strategy?.updated_at || ''}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <StrategyTags tags={strategy.tags || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StrategyEngine;
