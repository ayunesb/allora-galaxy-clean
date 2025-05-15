
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AsyncDataRenderer } from '@/components/ui/async-data-renderer';
import { Strategy } from '@/types/strategy';

interface StrategyDetailsProps {
  strategyId: string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategyId }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['strategy-details', strategyId],
    queryFn: async () => {
      if (!strategyId) throw new Error('Strategy ID is required');
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) throw new Error('Strategy not found');
      
      return data as Strategy;
    },
  });
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper to render status badge
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      draft: { color: 'bg-slate-200 text-slate-700', label: 'Draft' },
      active: { color: 'bg-green-100 text-green-700', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
      deprecated: { color: 'bg-red-100 text-red-700', label: 'Deprecated' },
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-700', label: status };
    
    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <AsyncDataRenderer
      data={data}
      isLoading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
    >
      {(strategy: Strategy) => (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{strategy.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
              </div>
              <div>
                {renderStatusBadge(strategy.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Created: {formatDate(strategy.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Updated: {formatDate(strategy.updated_at)}</span>
                    </div>
                    
                    {strategy.due_date && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Due: {formatDate(strategy.due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {strategy.tags && strategy.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {strategy.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Progress</h3>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{strategy.completion_percentage || 0}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${strategy.completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Team</h3>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Created by: {strategy.created_by || 'System'}</span>
                  </div>
                  
                  {strategy.approved_by && (
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Approved by: {strategy.approved_by}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AsyncDataRenderer>
  );
};

export default StrategyDetails;
