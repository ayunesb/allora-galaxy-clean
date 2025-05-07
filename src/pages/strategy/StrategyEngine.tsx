
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, Play, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/context/WorkspaceContext';
import PageHelmet from '@/components/PageHelmet';
import KPICard from '@/components/KPICard';
import { runStrategy } from '@/lib/strategy/runStrategy';

interface Strategy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  completion_percentage: number;
}

const StrategyEngine: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const workspace = useWorkspace();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    if (!workspace.currentTenant?.id) return;
    
    const fetchStrategies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('tenant_id', workspace.currentTenant.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setStrategies(data || []);
      } catch (error: any) {
        console.error('Error fetching strategies:', error);
        toast({
          title: "Error fetching strategies",
          description: error.message || "Failed to load strategies",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategies();
  }, [workspace.currentTenant, toast]);
  
  const executeStrategy = async (strategyId: string) => {
    if (!workspace.currentTenant?.id) return;
    
    setExecuting(strategyId);
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const result = await runStrategy({
        strategyId,
        tenantId: workspace.currentTenant.id,
        userId
      });
      
      if (result.success) {
        toast({
          title: "Strategy executed successfully",
          description: `Execution ID: ${result.execution_id || 'Unknown'}`,
          variant: "default",
        });
        
        // Refresh strategies to update completion percentage
        const { data: updatedStrategy } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .single();
          
        if (updatedStrategy) {
          setStrategies(prev => 
            prev.map(s => s.id === strategyId ? updatedStrategy : s)
          );
        }
      } else {
        throw new Error(result.error || 'Failed to execute strategy');
      }
    } catch (error: any) {
      console.error('Error executing strategy:', error);
      toast({
        title: "Error executing strategy",
        description: error.message || "Failed to execute strategy",
        variant: "destructive",
      });
    } finally {
      setExecuting(null);
    }
  };

  const getStatusBadgeColor = (status: Strategy['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'draft': default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="Strategy Engine"
        description="Create and manage AI-driven business strategies"
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Strategy Engine</h1>
          <p className="text-muted-foreground">Create and execute AI-driven business strategies</p>
        </div>
        
        <Button 
          className="mt-4 sm:mt-0" 
          onClick={() => navigate('/launch/builder')}
        >
          Create Strategy <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard 
          title="Active Strategies" 
          value={strategies.filter(s => s.status === 'approved').length.toString()}
          icon={<Check className="h-4 w-4" />}
        />
        <KPICard 
          title="Pending Approval" 
          value={strategies.filter(s => s.status === 'pending').length.toString()}
          icon={<AlertCircle className="h-4 w-4" />}
        />
        <KPICard 
          title="Completion Rate" 
          value={strategies.length ? 
            `${Math.round(
              strategies.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) / strategies.length
            )}%` : '0%'
          }
          icon={<Play className="h-4 w-4" />}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : strategies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-medium mb-2">No strategies found</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create your first AI-driven strategy to start automating your business tasks
            </p>
            <Button onClick={() => navigate('/launch/builder')}>
              Create Strategy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {strategies.map(strategy => (
            <Card key={strategy.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{strategy.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {new Date(strategy.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(strategy.status)}`}>
                    {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {strategy.description}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Progress</span>
                    <span>{strategy.completion_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${strategy.completion_percentage || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex space-x-2 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/galaxy?strategy=${strategy.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    className="flex-1"
                    disabled={strategy.status !== 'approved' || executing === strategy.id}
                    onClick={() => executeStrategy(strategy.id)}
                  >
                    {executing === strategy.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>Execute</>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrategyEngine;
