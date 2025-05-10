
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/shared';

interface StrategyDetailsProps {
  strategyId: string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategyId }) => {
  const { data: strategy, isError, error } = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select(`
          *,
          approved_by:approved_by(id, email),
          created_by:created_by(id, email)
        `)
        .eq('id', strategyId)
        .single();
      
      if (error) throw error;
      return data as Strategy;
    },
    enabled: !!strategyId,
  });

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-destructive">Error loading strategy details: {error.toString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!strategy) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p>Loading strategy details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          Strategy Details
          <div>{getStatusBadge(strategy.status)}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <dt className="text-sm font-medium">Title</dt>
            <dd className="text-sm md:col-span-2">{strategy.title}</dd>
          </div>
          
          <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <dt className="text-sm font-medium">Description</dt>
            <dd className="text-sm md:col-span-2">{strategy.description}</dd>
          </div>
          
          <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <dt className="text-sm font-medium">Created By</dt>
            <dd className="text-sm md:col-span-2">
              {strategy.created_by?.email || 'Unknown'}
            </dd>
          </div>
          
          <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <dt className="text-sm font-medium">Created At</dt>
            <dd className="text-sm md:col-span-2">
              {new Date(strategy.created_at).toLocaleString()} 
              ({formatDistanceToNow(new Date(strategy.created_at), { addSuffix: true })})
            </dd>
          </div>
          
          {strategy.approved_by && (
            <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <dt className="text-sm font-medium">Approved By</dt>
              <dd className="text-sm md:col-span-2">
                {strategy.approved_by.email}
              </dd>
            </div>
          )}
          
          {strategy.due_date && (
            <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <dt className="text-sm font-medium">Due Date</dt>
              <dd className="text-sm md:col-span-2">
                {new Date(strategy.due_date).toLocaleString()}
                ({formatDistanceToNow(new Date(strategy.due_date), { addSuffix: true })})
              </dd>
            </div>
          )}
          
          {strategy.tags && strategy.tags.length > 0 && (
            <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <dt className="text-sm font-medium">Tags</dt>
              <dd className="text-sm md:col-span-2 flex flex-wrap gap-1">
                {strategy.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </dd>
            </div>
          )}
          
          <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <dt className="text-sm font-medium">Completion</dt>
            <dd className="text-sm md:col-span-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${strategy.completion_percentage || 0}%` }}
                ></div>
              </div>
              <span className="text-xs mt-1 block">{strategy.completion_percentage || 0}%</span>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
