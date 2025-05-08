
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Strategy } from '@/types';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StrategyHeader } from '@/components/strategy/StrategyHeader';
import { StrategyActions } from '@/components/strategy/StrategyActions';
import { StrategyDescription } from '@/components/strategy/StrategyDescription';
import { StrategyMetadata } from '@/components/strategy/StrategyMetadata';

const StrategyEngine = () => {
  const { id: strategyId } = useParams<{ id: string }>();
  const { tenant } = useWorkspace();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStrategy = async () => {
      if (!strategyId || !tenant?.id) return;
      
      try {
        setIsLoading(true);
        
        // Here we would fetch the strategy from the API
        // For now, let's mock the strategy data
        setStrategy({
          id: strategyId,
          title: 'Sample Strategy',
          description: 'This is a sample strategy for demonstration purposes',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ['marketing', 'social-media'],
          tenant_id: tenant.id,
          created_by: 'user-123',
          completion_percentage: 0
        });
      } catch (error) {
        console.error('Error fetching strategy:', error);
        toast({
          title: 'Error',
          description: 'Failed to load strategy details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStrategy();
  }, [strategyId, tenant?.id, toast]);

  const handleExecute = async () => {
    if (!strategy || !tenant?.id) return;
    
    try {
      setIsExecuting(true);
      
      const result = await runStrategy({
        strategyId: strategy.id,
        tenantId: tenant.id
      });
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Strategy executed successfully',
          variant: 'default',
        });
        
        // Update strategy status or redirect to results page
        setStrategy(prev => prev ? { ...prev, status: 'completed' } : null);
      } else {
        toast({
          title: 'Execution failed',
          description: result.error || 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error executing strategy:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to execute strategy',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleBack = () => {
    navigate('/launch');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Strategy not found</h1>
          <p className="text-muted-foreground mb-4">
            The strategy you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={handleBack}>Back to Strategies</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <StrategyHeader
        onBack={handleBack}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-2">{strategy.title}</h1>
            <StrategyDescription description={strategy.description} />
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Execution</h2>
            <StrategyActions
              strategy={strategy}
              onExecute={handleExecute}
              isExecuting={isExecuting}
            />
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="p-6">
            <StrategyMetadata strategy={strategy} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StrategyEngine;
