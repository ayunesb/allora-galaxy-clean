import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Strategy } from '@/types';
import StrategyHeader from '@/components/strategy/StrategyHeader';
import StrategyDescription from '@/components/strategy/StrategyDescription';
import StrategyActions from '@/components/strategy/StrategyActions';
import StrategyMetadata from '@/components/strategy/StrategyMetadata';
import StrategyTags from '@/components/strategy/StrategyTags';
import { useTenantId } from '@/hooks/useTenantId';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { Skeleton } from '@/components/ui/skeleton';

const StrategyEngine: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenantId } = useTenantId();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id && tenantId) {
      loadStrategy(id);
    }
  }, [id, tenantId]);

  const loadStrategy = async (strategyId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw new Error(`Failed to load strategy: ${error.message}`);
      
      if (!data) {
        setError('Strategy not found');
      } else {
        setStrategy(data as Strategy);
      }
    } catch (err: any) {
      console.error('Error loading strategy:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleExecuteStrategy = async () => {
    if (!strategy || !tenantId) return;

    try {
      setExecuting(true);
      
      // Log that execution is starting
      await logSystemEvent(
        tenantId,
        'strategy',
        'strategy_execution_started',
        { strategy_id: strategy.id }
      );
      
      // Execute the strategy
      const result = await runStrategy({
        strategyId: strategy.id,
        tenantId,
      });
      
      if (result.success) {
        toast({
          title: 'Strategy Executed',
          description: 'The strategy has been executed successfully.',
        });
        
        // Refresh the strategy data
        loadStrategy(strategy.id);
      } else {
        toast({
          title: 'Execution Failed',
          description: result.error || 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Error executing strategy:', err);
      toast({
        title: 'Execution Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };
  
  const handleApprove = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('strategies')
        .update({ status: 'approved' })
        .eq('id', strategy?.id);
        
      if (error) throw error;
      
      toast({
        title: 'Strategy Approved',
        description: 'The strategy has been approved successfully.',
      });
      
      // Refresh the strategy data
      loadStrategy(strategy!.id);
    } catch (err: any) {
      toast({
        title: 'Approval Failed',
        description: err.message || 'Failed to approve the strategy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('strategies')
        .update({ status: 'rejected' })
        .eq('id', strategy?.id);
        
      if (error) throw error;
      
      toast({
        title: 'Strategy Rejected',
        description: 'The strategy has been rejected.',
      });
      
      // Refresh the strategy data
      loadStrategy(strategy!.id);
    } catch (err: any) {
      toast({
        title: 'Rejection Failed',
        description: err.message || 'Failed to reject the strategy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-12 w-32 mb-4" />
        </>
      ) : strategy ? (
        <>
          <div className="mb-6">
            <StrategyHeader 
              onBack={handleBack}
              status={strategy.status}
            />
            <h1 className="text-3xl font-bold mt-4">{strategy.title}</h1>
            {strategy.tags && strategy.tags.length > 0 && (
              <div className="mt-2">
                <StrategyTags tags={strategy.tags} />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="plugins">Plugins</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <Card>
                    <CardContent className="pt-6">
                      <StrategyDescription description={strategy.description} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="timeline">
                  <Card>
                    <CardContent className="py-6">
                      <p>Timeline content will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="plugins">
                  <Card>
                    <CardContent className="py-6">
                      <p>Plugins used in this strategy will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="metrics">
                  <Card>
                    <CardContent className="py-6">
                      <p>Metrics and KPIs will be displayed here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <StrategyActions 
                strategyId={strategy.id}
                status={strategy.status}
                onExecute={handleExecuteStrategy}
                onApprove={handleApprove}
                onReject={handleReject}
                isExecuting={executing}
              />
              
              <Card className="mt-6">
                <CardContent className="py-6">
                  <StrategyMetadata 
                    created_at={strategy.created_at}
                    updated_at={strategy.updated_at}
                    created_by={strategy.created_by}
                    approved_by={strategy.approved_by}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default StrategyEngine;
