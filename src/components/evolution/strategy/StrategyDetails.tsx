import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { format } from 'date-fns';

interface StrategyDetailsProps {
  strategyId: string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategyId }) => {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByUser, setCreatedByUser] = useState<any>(null);
  const [approvedByUser, setApprovedByUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategyDetails = async () => {
      if (!strategyId || strategyId === 'default') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch strategy
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .maybeSingle();
          
        if (strategyError) throw strategyError;

        if (strategyData) {
          const typedStrategy: Strategy = formatStrategy(strategyData);
          
          setStrategy(typedStrategy);
        }
        
        // Fetch created by user
        if (strategyData?.created_by) {
          const { data: createdBy, error: createdByError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', strategyData.created_by)
            .maybeSingle();
            
          if (!createdByError && createdBy) {
            setCreatedByUser(createdBy);
          }
        }
        
        // Fetch approved by user
        if (strategyData?.approved_by) {
          const { data: approvedBy, error: approvedByError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', strategyData.approved_by)
            .maybeSingle();
            
          if (!approvedByError && approvedBy) {
            setApprovedByUser(approvedBy);
          }
        }
      } catch (err: any) {
        console.error('Error fetching strategy details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategyDetails();
  }, [strategyId]);

  // Updated to handle undefined/null values
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const formatUser = (user: any) => {
    if (!user) return 'Unknown User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    // Check if user is a string (just the ID)
    if (typeof user === 'string') {
      return user.substring(0, 8) + '...';
    }
    
    return user.first_name || user.last_name || user.email || user.id?.substring(0, 8) + '...';
  };

  const formatStrategy = (strategy: any): Strategy => {
    return {
      id: strategy.id,
      tenant_id: strategy.tenant_id,
      title: strategy.title,
      description: strategy.description,
      status: strategy.status,
      created_by: strategy.created_by,
      created_at: strategy.created_at,
      updated_at: strategy.updated_at,
      approved_by: strategy.approved_by,
      approved_at: strategy.approved_at,
      rejected_by: strategy.rejected_by,
      rejected_at: strategy.rejected_at,
      priority: strategy.priority,
      tags: strategy.tags,
      due_date: strategy.due_date,
      completion_percentage: strategy.completion_percentage,
      metadata: {} // Add empty metadata to satisfy the type
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load strategy details: {error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Strategy Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please select a strategy to view its details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{strategy.title}</CardTitle>
        {getStatusBadge(strategy.status)}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Description</h3>
          <p className="mt-2 text-muted-foreground whitespace-pre-line">{strategy.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <p className="mt-1 font-medium">{strategy.status}</p>
          </div>
          
          {strategy.priority && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
              <p className="mt-1 font-medium capitalize">{strategy.priority}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
            <p className="mt-1">{formatUser(createdByUser || strategy.created_by)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
            <p className="mt-1">{formatDate(strategy.created_at)}</p>
          </div>
          
          {strategy.approved_by && (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Approved By</h3>
                <p className="mt-1">{formatUser(approvedByUser || strategy.approved_by)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Approved At</h3>
                <p className="mt-1">{formatDate(strategy.approved_at)}</p>
              </div>
            </>
          )}
          
          {strategy.completion_percentage !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Completion</h3>
              <p className="mt-1 font-medium">{strategy.completion_percentage}%</p>
            </div>
          )}
          
          {strategy.due_date && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
              <p className="mt-1">{formatDate(strategy.due_date)}</p>
            </div>
          )}
        </div>
        
        {strategy.tags && strategy.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {strategy.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
