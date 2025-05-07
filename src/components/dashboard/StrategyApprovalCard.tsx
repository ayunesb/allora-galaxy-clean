
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Strategy } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Clock } from 'lucide-react';

const StrategyApprovalCard: React.FC = () => {
  const navigate = useNavigate();
  const tenantId = useTenantId();

  // Query for pending strategies that need approval
  const { data: pendingStrategies, isLoading } = useQuery({
    queryKey: ['strategies', tenantId, 'pending'],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching pending strategies:', error);
        return [];
      }
      
      return data as Strategy[];
    },
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasPendingStrategies = pendingStrategies && pendingStrategies.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Strategies Awaiting Approval</CardTitle>
        <CardDescription>Review and approve pending strategies</CardDescription>
      </CardHeader>
      <CardContent>
        {hasPendingStrategies ? (
          <div className="space-y-3">
            {pendingStrategies.map((strategy) => (
              <div key={strategy.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{strategy.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" /> 
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="ml-3" variant="outline">Pending</Badge>
              </div>
            ))}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between" 
                onClick={() => navigate('/launch')}
              >
                <span>Review all pending strategies</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No strategies awaiting approval</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyApprovalCard;
