
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Strategy } from '@/types/strategy';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface StrategyDetailsProps {
  strategyId: string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategyId }) => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStrategyDetails = async () => {
      if (!strategyId || strategyId === 'default') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .single();

        if (error) throw error;
        
        // Convert the database result to match our Strategy type
        const typedStrategy: Strategy = {
          ...data,
          // Ensure required fields are present and optional fields are correctly typed
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          tenant_id: data.tenant_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          created_by: data.created_by,
          approved_by: data.approved_by,
          due_date: data.due_date,
          priority: data.priority,
          tags: data.tags,
          completion_percentage: data.completion_percentage,
          metadata: data.metadata
        };
        
        setStrategy(typedStrategy);
      } catch (err: any) {
        console.error('Error fetching strategy details:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategyDetails();
  }, [strategyId]);

  // Helper to render status badges
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date function
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p className="font-medium">Error loading strategy</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please select a strategy to view details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{strategy.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {renderStatusBadge(strategy.status)}
              {strategy.priority && (
                <Badge variant="outline">Priority: {strategy.priority}</Badge>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            <p>Created: {formatDate(strategy.created_at)}</p>
            {strategy.due_date && <p>Due: {formatDate(strategy.due_date)}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{strategy.description}</p>
          </div>

          {strategy.tags && strategy.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {strategy.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {strategy.completion_percentage !== null && strategy.completion_percentage !== undefined && (
            <div>
              <h3 className="text-lg font-medium mb-2">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${strategy.completion_percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1">{strategy.completion_percentage}% complete</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Details</h3>
              <ul className="space-y-2">
                <li className="flex">
                  <span className="text-muted-foreground w-24">ID:</span>
                  <span className="font-mono text-xs">{strategy.id}</span>
                </li>
                {strategy.tenant_id && (
                  <li className="flex">
                    <span className="text-muted-foreground w-24">Tenant:</span>
                    <span className="font-mono text-xs">{strategy.tenant_id}</span>
                  </li>
                )}
                {strategy.created_by && (
                  <li className="flex">
                    <span className="text-muted-foreground w-24">Created by:</span>
                    <span className="font-mono text-xs">{strategy.created_by}</span>
                  </li>
                )}
                {strategy.approved_by && (
                  <li className="flex">
                    <span className="text-muted-foreground w-24">Approved by:</span>
                    <span className="font-mono text-xs">{strategy.approved_by}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
